// Store Pinia pour la gestion des demandes de dépôt côté administration et responsable (workflow complet, assignation, publication)
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToastStore } from './toast'
import { useAuthStore } from './auth'
import { adminService } from '@/services/api/admin.service'
import { managerService } from '@/services/api/manager.service'

// Mapping des codes ISO de langue vers leur libellé français
const ISO_LANGUAGES = {
  fr: 'Français', en: 'Anglais', es: 'Espagnol', de: 'Allemand',
  it: 'Italien', pt: 'Portugais', nl: 'Néerlandais', ru: 'Russe',
  zh: 'Chinois', ar: 'Arabe', ja: 'Japonais', ko: 'Coréen',
}

// Libellés des types de document
const DOCUMENT_TYPE_LABELS = {
  livre: 'Livre', memoire: 'Mémoire', these: 'Thèse', article: 'Article',
  revue: 'Revue', rapport: 'Rapport', guide: 'Guide', autre: 'Autre',
}

// Configuration complète des statuts (libellé, classe CSS, étape du workflow)
const STATUS_LABELS = {
  pending: { label: 'En attente', cls: 'bg-gray-100 text-gray-600', step: 0 },
  assigned: { label: 'Assignée', cls: 'bg-blue-100 text-blue-700', step: 1 },
  approved_by_manager: { label: 'Validée (resp.)', cls: 'bg-teal-100 text-teal-700', step: 2 },
  rejected_by_manager: { label: 'Refusée (resp.)', cls: 'bg-orange-100 text-orange-700', step: -1 },
  second_review: { label: 'Second avis', cls: 'bg-purple-100 text-purple-700', step: 2 },
  manager_approved: { label: 'Validée (resp.)', cls: 'bg-teal-100 text-teal-700', step: 2 },
  manager_rejected: { label: 'Refusée (resp.)', cls: 'bg-orange-100 text-orange-700', step: -1 },
  second_opinion: { label: 'Second avis', cls: 'bg-purple-100 text-purple-700', step: 2 },
  approved: { label: 'Approuvée', cls: 'bg-green-100 text-green-700', step: 3 },
  approved_published: { label: 'Publiée', cls: 'bg-emerald-100 text-emerald-800', step: 4 },
  rejected: { label: 'Rejetée', cls: 'bg-red-100 text-red-700', step: -2 },
  published: { label: 'Publiée', cls: 'bg-emerald-100 text-emerald-800', step: 4 },
}

// Données factices pour les responsables (utilisées en fallback si l'API échoue)
const MOCK_MANAGERS = [
  { id: 1, first_name: 'Kofi', last_name: 'Anan', email: 'kofi.anan@lectoria.bj', role: 'responsable_demande', status: 'active', open_deposits: 3 },
  { id: 2, first_name: 'Awa', last_name: 'Diallo', email: 'awa.diallo@lectoria.bj', role: 'responsable_demande', status: 'active', open_deposits: 1 },
  { id: 3, first_name: 'Jean', last_name: 'Kouamé', email: 'jean.kouame@lectoria.bj', role: 'responsable_demande', status: 'active', open_deposits: 5 },
  { id: 4, first_name: 'Fatima', last_name: 'Ouedraogo', email: 'fatima.ouedraogo@lectoria.bj', role: 'responsable_demande', status: 'active', open_deposits: 0 },
]

// Données factices pour les utilisateurs (fallback)
const MOCK_USERS = [
  { id: 1, first_name: 'Marie', last_name: 'Zannou', email: 'marie.zannou@email.bj' },
  { id: 2, first_name: 'Amadou', last_name: 'Touré', email: 'amadou.toure@email.bj' },
  { id: 3, first_name: 'Safia', last_name: 'Mohamed', email: 'safia.mohamed@email.bj' },
  { id: 4, first_name: 'David', last_name: 'Hounkpè', email: 'david.hounkpe@email.bj' },
]

// Étapes du workflow pour l'affichage du stepper
const STEPS = [
  { key: 'pending', label: 'Soumise', step: 0 },
  { key: 'assigned', label: 'Assignée', step: 1 },
  { key: 'manager_approved', label: 'Validation Responsable', step: 2 },
  { key: 'approved', label: 'Approuvée', step: 3 },
  { key: 'published', label: 'Publiée', step: 4 },
]

let mockIdCounter = 0

/**
 * Génère un jeu de données factices pour les demandes de dépôt.
 * @returns {Array} Liste de dépôts mockés.
 */
function buildMockDeposits() {
  const d = (n) => { const x = new Date(); x.setDate(x.getDate() - n); return x.toISOString() }
  const h = (n) => { const x = new Date(); x.setHours(x.getHours() - n); return x.toISOString() }
  return [
    { id: ++mockIdCounter, title: 'Étude sur le Commerce Transfrontalier au Bénin', type: 'memoire', category: { id: 1, name: 'Économie' }, year: 2024, language: 'fr', pages: 187, isbn: '978-2-1234-5680-1', publisher: 'Éditions Universitaires du Bénin', authors: ['Marie Zannou'], summary: 'Cette étude examine les dynamiques du commerce transfrontalier.', keywords: ['commerce', 'Bénin'], file: 'etude.pdf', submittedBy: MOCK_USERS[0], submittedAt: d(1), assignedManagerId: 1, assignedAt: h(12), status: 'assigned', history: [{ actor: 'Marie Zannou', role: 'Utilisateur', action: 'Soumission', comment: null, at: d(1) }, { actor: 'Admin', role: 'Administrateur', action: 'Assignation', comment: 'Assigné à Kofi Anan', at: h(12) }], managerComment: null, adminDecisionComment: null, referenceId: null, adminOverride: false },
    { id: ++mockIdCounter, title: 'Impact du Numérique sur l\'Éducation', type: 'article', category: { id: 2, name: 'Éducation' }, year: 2025, language: 'fr', pages: 45, isbn: null, publisher: null, authors: ['Amadou Touré'], summary: 'Analyse des technologies numériques.', keywords: ['numérique', 'éducation'], file: 'numerique.pdf', submittedBy: MOCK_USERS[1], submittedAt: d(5), assignedManagerId: 2, assignedAt: d(4), status: 'manager_approved', history: [{ actor: 'Amadou Touré', role: 'Utilisateur', action: 'Soumission', comment: null, at: d(5) }, { actor: 'Admin', role: 'Administrateur', action: 'Assignation', comment: 'Assigné à Awa Diallo', at: d(4) }, { actor: 'Awa Diallo', role: 'Responsable', action: 'Approbation', comment: 'Bien structuré.', at: d(1) }], managerComment: 'Bien structuré.', adminDecisionComment: null, referenceId: null, adminOverride: false },
    { id: ++mockIdCounter, title: 'Changements Climatiques et Agriculture', type: 'these', category: { id: 3, name: 'Environnement' }, year: 2024, language: 'fr', pages: 320, isbn: '978-2-3456-7890-1', publisher: 'Presses Universitaires', authors: ['Safia Mohamed'], summary: 'Thèse sur les changements climatiques.', keywords: ['climat', 'agriculture'], file: 'climat.pdf', submittedBy: MOCK_USERS[2], submittedAt: d(3), assignedManagerId: null, assignedAt: null, status: 'pending', history: [{ actor: 'Safia Mohamed', role: 'Utilisateur', action: 'Soumission', comment: null, at: d(3) }], managerComment: null, adminDecisionComment: null, referenceId: null, adminOverride: false },
    { id: ++mockIdCounter, title: 'Architecture Traditionnelle au Bénin', type: 'livre', category: { id: 4, name: 'Architecture' }, year: 2023, language: 'fr', pages: 250, isbn: '978-1-2345-6789-0', publisher: 'Éditions Patrimoine', authors: ['David Hounkpè'], summary: 'Ouvrage sur l\'architecture traditionnelle.', keywords: ['architecture', 'Bénin'], file: 'architecture.pdf', submittedBy: MOCK_USERS[3], submittedAt: d(10), assignedManagerId: 1, assignedAt: d(9), status: 'second_opinion', history: [{ actor: 'David Hounkpè', role: 'Utilisateur', action: 'Soumission', comment: null, at: d(10) }, { actor: 'Admin', role: 'Administrateur', action: 'Assignation', comment: 'Assigné à Kofi Anan', at: d(9) }, { actor: 'Kofi Anan', role: 'Responsable', action: 'Approbation', comment: 'Travail remarquable.', at: d(6) }, { actor: 'Admin', role: 'Administrateur', action: 'Second avis', comment: 'Avis requis.', at: d(4) }], managerComment: 'Travail remarquable.', adminDecisionComment: 'Avis requis.', referenceId: null, adminOverride: false },
    { id: ++mockIdCounter, title: 'Guide du Jardinage Urbain', type: 'guide', category: { id: 5, name: 'Agriculture' }, year: 2025, language: 'fr', pages: 120, isbn: null, publisher: null, authors: ['Marie Zannou'], summary: 'Guide pour le jardinage urbain.', keywords: ['jardinage'], file: 'jardinage.pdf', submittedBy: MOCK_USERS[0], submittedAt: d(15), assignedManagerId: 2, assignedAt: d(14), status: 'manager_rejected', history: [{ actor: 'Marie Zannou', role: 'Utilisateur', action: 'Soumission', comment: null, at: d(15) }, { actor: 'Admin', role: 'Administrateur', action: 'Assignation', comment: 'Assigné à Awa Diallo', at: d(14) }, { actor: 'Awa Diallo', role: 'Responsable', action: 'Rejet', comment: 'Manque de références.', at: d(10) }], managerComment: 'Manque de références.', adminDecisionComment: null, referenceId: null, adminOverride: false },
    { id: ++mockIdCounter, title: 'IA au Service de la Santé', type: 'rapport', category: { id: 6, name: 'Technologie' }, year: 2025, language: 'en', pages: 85, isbn: null, publisher: 'WHO Press', authors: ['Amadou Touré'], summary: 'Rapport sur l\'IA dans la santé.', keywords: ['IA', 'santé'], file: 'ia.pdf', submittedBy: MOCK_USERS[1], submittedAt: d(30), assignedManagerId: 1, assignedAt: d(29), status: 'approved_published', history: [{ actor: 'Amadou Touré', role: 'Utilisateur', action: 'Soumission', comment: null, at: d(30) }, { actor: 'Admin', role: 'Administrateur', action: 'Assignation', comment: 'Assigné à Kofi Anan', at: d(29) }, { actor: 'Kofi Anan', role: 'Responsable', action: 'Approbation', comment: 'Excellent.', at: d(25) }, { actor: 'Admin', role: 'Administrateur', action: 'Publication', comment: 'Publiée.', at: d(20) }], managerComment: 'Excellent.', adminDecisionComment: 'Publiée.', referenceId: 42, adminOverride: false },
    { id: ++mockIdCounter, title: 'Poésie Contemporaine Béninoise', type: 'livre', category: { id: 7, name: 'Littérature' }, year: 2024, language: 'fr', pages: 200, isbn: null, publisher: null, authors: ['David Hounkpè'], summary: 'Recueil de poésie.', keywords: ['poésie'], file: 'poesie.pdf', submittedBy: MOCK_USERS[3], submittedAt: d(45), assignedManagerId: 3, assignedAt: d(44), status: 'rejected', history: [{ actor: 'David Hounkpè', role: 'Utilisateur', action: 'Soumission', comment: null, at: d(45) }, { actor: 'Admin', role: 'Administrateur', action: 'Assignation', comment: 'Assigné à Jean Kouamé', at: d(44) }, { actor: 'Jean Kouamé', role: 'Responsable', action: 'Rejet', comment: 'Pas conforme.', at: d(40) }, { actor: 'Admin', role: 'Administrateur', action: 'Rejet définitif', comment: 'Confirmé.', at: d(35) }], managerComment: 'Pas conforme.', adminDecisionComment: 'Confirmé.', referenceId: null, adminOverride: false },
  ]
}

/**
 * Normalise un objet dépôt provenant de l'API vers le format interne du store.
 * @param {Object} item - Dépôt brut de l'API.
 * @returns {Object} Dépôt normalisé.
 */
function normalizeApiDeposit(item) {
  const authorNames = item.author
    ? item.author.split(',').map(s => s.trim()).filter(Boolean)
    : []
  // Mappe les statuts API vers les clés internes
  const mappedStatus = ({
    approved_by_manager: 'manager_approved',
    rejected_by_manager: 'manager_rejected',
    second_review: 'second_opinion',
    approved: 'approved_published',
    published: 'approved_published',
  })[item.status] || item.status

  return {
    id: item.id,
    title: item.title,
    type: item.type || null,
    category: item.category || null,
    year: item.publication_year || null,
    language: item.language || 'fr',
    pages: item.pages || null,
    isbn: item.isbn || null,
    publisher: item.publisher || null,
    authors: authorNames,
    summary: item.description || item.summary || null,
    keywords: item.keywords || [],
    file: item.proposed_file || null,
    cover_image: null,
    submittedBy: item.applicant
      ? { id: item.applicant.id, first_name: item.applicant.first_name, last_name: item.applicant.last_name, email: item.applicant.email }
      : null,
    submittedAt: item.created_at || item.submittedAt || null,
    assignedManagerId: item.assigned_manager_id || item.assignedManagerId || (item.assignedManager ? item.assignedManager.id : null) || null,
    assignedAt: item.updated_at || item.assignedAt || null,
    status: mappedStatus,
    history: item.history || [],
    managerComment: item.rejection_reason || item.managerComment || null,
    adminDecisionComment: item.adminDecisionComment || null,
    referenceId: item.reference_id || item.referenceId || null,
    adminOverride: item.adminOverride || false,
    _created_at: item.created_at,
    _updated_at: item.updated_at,
  }
}

export const useDepositsStore = defineStore('deposits', () => {
  // Liste complète des demandes de dépôt
  const deposits = ref([])
  // Demande de dépôt actuellement consultée
  const currentDeposit = ref(null)
  // Indicateur de chargement principal
  const isLoading = ref(false)
  // Indicateur de soumission en cours
  const isSubmitting = ref(false)
  // Message d'erreur
  const error = ref(null)
  // Journal des activités récentes
  const activityLogs = ref([])
  // Informations de pagination
  const pagination = ref(null)

  // Nombre de demandes en attente (pending ou assigned)
  const pendingCount = computed(() => deposits.value.filter(d => d.status === 'pending' || d.status === 'assigned').length)

  /**
   * Ajoute une entrée dans l'historique d'un dépôt.
   * @param {Object} deposit - Le dépôt cible.
   * @param {string} actor - Nom de l'acteur.
   * @param {string} role - Rôle de l'acteur.
   * @param {string} action - Action effectuée.
   * @param {string|null} comment - Commentaire optionnel.
   */
  function _addHistory(deposit, actor, role, action, comment) {
    deposit.history.push({ actor, role, action, comment: comment || null, at: new Date().toISOString() })
  }

  /**
   * Ajoute une entrée dans le journal d'activité.
   * @param {string} action - Description de l'action.
   * @param {number|string} depositId - Identifiant du dépôt concerné.
   * @param {string} [color='orange'] - Couleur associée.
   */
  function _addActivityLog(action, depositId, color = 'orange') {
    activityLogs.value.unshift({ id: Date.now(), type: 'Workflow', action, deposit_id: depositId, color, created_at: new Date().toISOString() })
  }

  /**
   * Affiche une notification simulée.
   * @param {string} message - Message de notification.
   */
  function _simulateNotification(message) {
    useToastStore().info(`🔔 ${message}`)
  }

  /**
   * Met à jour un dépôt dans la liste locale et dans currentDeposit si nécessaire.
   * @param {number|string} id - Identifiant du dépôt.
   * @param {Object} updated - Données mises à jour.
   */
  function _updateInStore(id, updated) {
    const idx = deposits.value.findIndex(d => d.id === id)
    if (idx !== -1) deposits.value[idx] = { ...deposits.value[idx], ...updated }
    if (currentDeposit.value?.id === id) currentDeposit.value = { ...currentDeposit.value, ...updated }
  }

  /**
   * Retourne la configuration complète d'un statut donné.
   * @param {string} s - Code du statut.
   * @returns {Object} Configuration (label, classe CSS, étape).
   */
  function getStatusConfig(s) {
    return STATUS_LABELS[s] || STATUS_LABELS[({
      approved_by_manager: 'manager_approved',
      rejected_by_manager: 'manager_rejected',
      second_review: 'second_opinion',
      approved: 'approved_published',
      published: 'approved_published',
    })[s]] || { label: s || 'Inconnu', cls: 'bg-gray-100 text-gray-500', step: -99 }
  }

  /**
   * Retourne le libellé d'un type de document.
   * @param {string} type - Code du type.
   * @returns {string} Libellé.
   */
  function getTypeLabel(type) { return DOCUMENT_TYPE_LABELS[type] || type || 'Non spécifié' }

  /**
   * Retourne le libellé d'une langue.
   * @param {string} lang - Code ISO de la langue.
   * @returns {string} Libellé.
   */
  function getLanguageLabel(lang) { return ISO_LANGUAGES[lang] || lang || 'Non spécifié' }

  /**
   * Retourne les initiales d'un utilisateur.
   * @param {Object} user - Utilisateur.
   * @returns {string} Initiales en majuscules.
   */
  function getUserInitials(user) {
    if (!user) return '?'
    return `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase()
  }

  /**
   * Formate une date au format court français.
   * @param {string|Date} d - Date à formater.
   * @returns {string} Date formatée ou '—'.
   */
  function formatDate(d) {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return '—' }
  }

  /**
   * Formate une date avec heure au format long français.
   * @param {string|Date} d - Date à formater.
   * @returns {string} Date et heure formatées ou '—'.
   */
  function formatDateTime(d) {
    if (!d) return '—'
    try { return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return '—' }
  }

  /**
   * Calcule un texte relatif (il y a X min/h/jour).
   * @param {string|Date} d - Date de référence.
   * @returns {string} Texte relatif.
   */
  function getTimeAgo(d) {
    if (!d) return ''
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 60) return `Il y a ${m} min`
    const h = Math.floor(m / 60)
    if (h < 24) return `Il y a ${h} h`
    const j = Math.floor(h / 24)
    return `Il y a ${j} jour${j > 1 ? 's' : ''}`
  }

  /**
   * Calcule le nombre de jours écoulés depuis une date.
   * @param {string|Date} d - Date de référence.
   * @returns {number} Nombre de jours.
   */
  function getAgingDays(d) {
    try { return d ? Math.floor((Date.now() - new Date(d)) / 86400000) : 0 } catch { return 0 }
  }

  /**
   * Retourne un badge de vieillissement selon le nombre de jours.
   * @param {string|Date} d - Date de référence.
   * @returns {Object|null} Badge avec classe CSS et libellé, ou null.
   */
  function getAgingBadge(d) {
    const days = getAgingDays(d)
    if (days >= 7) return { cls: 'bg-red-100 text-red-700', label: `${days} jours` }
    if (days >= 3) return { cls: 'bg-orange-100 text-orange-700', label: `${days} jours` }
    return null
  }

  /**
   * Retourne la liste des responsables disponibles (triés par charge de travail croissante).
   * @returns {Array} Liste des responsables actifs.
   */
  function getAvailableManagers() {
    return MOCK_MANAGERS.filter(m => m.status === 'active' && m.role === 'responsable_demande')
      .sort((a, b) => a.open_deposits - b.open_deposits)
  }

  /**
   * Retourne tous les responsables actifs.
   * @returns {Array} Liste des responsables actifs.
   */
  function getActiveManagers() { return MOCK_MANAGERS.filter(m => m.status === 'active' && m.role === 'responsable_demande') }

  /**
   * Retourne un responsable par son identifiant.
   * @param {number} id - Identifiant du responsable.
   * @returns {Object|null} Responsable trouvé ou null.
   */
  function getManagerById(id) { return MOCK_MANAGERS.find(m => m.id === id) || null }

  /**
   * Retourne un utilisateur mocké par son identifiant.
   * @param {number} id - Identifiant utilisateur.
   * @returns {Object|null} Utilisateur trouvé ou null.
   */
  function getUserById(id) { return MOCK_USERS.find(u => u.id === id) || null }

  /**
   * Récupère la liste paginée des demandes de dépôt (fallback mock si API indisponible).
   * @param {Object} [params={}] - Paramètres de filtrage et pagination.
   * @returns {Promise<Array>} Liste normalisée des dépôts.
   */
  async function fetchDeposits(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminService.getDeposits(params)
      const list = data.data || data || []
      deposits.value = list.map(normalizeApiDeposit)
      pagination.value = data.data ? { current_page: data.current_page, last_page: data.last_page, per_page: data.per_page, total: data.total } : null
      return deposits.value
    } catch (err) {
      // Fallback vers les données mockées si l'API est indisponible et la liste vide
      if (!deposits.value.length) {
        deposits.value = buildMockDeposits()
      }
      error.value = err.response?.data?.message || null
      return deposits.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupère une demande de dépôt par son identifiant (fallback local si API indisponible).
   * @param {number|string} id - Identifiant du dépôt.
   * @returns {Promise<Object>} Dépôt normalisé.
   */
  async function fetchDeposit(id) {
    isLoading.value = true
    error.value = null
    try {
      const data = await adminService.getDeposit(id)
      const item = data.deposit_request || data
      currentDeposit.value = normalizeApiDeposit(item)
      return currentDeposit.value
    } catch (err) {
      // Fallback : chercher dans la liste locale
      const found = deposits.value.find(d => String(d.id) === String(id))
      if (found) {
        currentDeposit.value = JSON.parse(JSON.stringify(found))
        return currentDeposit.value
      }
      error.value = err.response?.data?.message || 'Demande introuvable.'
      throw new Error(error.value, { cause: err })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Assigne un responsable à une demande de dépôt.
   * @param {number|string} id - Identifiant du dépôt.
   * @param {number} managerId - Identifiant du responsable.
   * @returns {Promise<Object>} Dépôt mis à jour.
   */
  async function assignManager(id, managerId) {
    isSubmitting.value = true
    try {
      const result = await adminService.assignDeposit(id, managerId)
      const updated = normalizeApiDeposit(result.deposit_request || result)
      _updateInStore(id, updated)
      const mgr = getManagerById(managerId)
      if (mgr) mgr.open_deposits = (mgr.open_deposits || 0) + 1
      useToastStore().success('Demande assignée avec succès.')
      _simulateNotification(`La demande ${id} vous a été assignée.`)
      return updated
    } catch (err) {
      // Fallback simulation si l'API échoue
      const msg = err.response?.data?.message || "Erreur lors de l'assignation."
      const deposit = deposits.value.find(d => String(d.id) === String(id))
      if (deposit) {
        deposit.status = 'assigned'
        deposit.assignedManagerId = managerId
        deposit.assignedAt = new Date().toISOString()
        _addHistory(deposit, 'Admin System', 'Administrateur', 'Assignation', `Assigné au responsable #${managerId}`)
        _updateInStore(id, deposit)
        useToastStore().success('Demande assignée (mode simulation).')
        _simulateNotification(`La demande ${id} vous a été assignée.`)
        return deposit
      }
      useToastStore().error(msg)
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Approuve et publie une demande de dépôt (génère une référence).
   * @param {number|string} id - Identifiant du dépôt.
   * @returns {Promise<Object>} Dépôt mis à jour.
   */
  async function approveAndPublish(id) {
    isSubmitting.value = true
    try {
      const result = await adminService.publishDeposit(id)
      const updated = normalizeApiDeposit(result.deposit_request || result)
      _updateInStore(id, { ...updated, status: 'approved_published', referenceId: result.reference?.id || updated.referenceId })
      useToastStore().success('✅ Demande approuvée et publiée avec succès.')
      _addActivityLog(`Publication de la demande ${id}`, id, 'green')
      _simulateNotification(`La demande ${id} a été publiée.`)
      return updated
    } catch (err) {
      // Fallback simulation
      const deposit = deposits.value.find(d => String(d.id) === String(id))
      if (deposit) {
        deposit.status = 'approved_published'
        deposit.referenceId = Math.floor(Math.random() * 1000) + 100
        _addHistory(deposit, 'Admin System', 'Administrateur', 'Approbation et publication', 'Publiée dans le catalogue.')
        _updateInStore(id, deposit)
        useToastStore().success('✅ Demande approuvée et publiée (mode simulation).')
        _addActivityLog(`Publication simulée de ${id}`, id, 'green')
        _simulateNotification(`La demande ${id} a été publiée.`)
        return deposit
      }
      useToastStore().error(err.response?.data?.message || 'Erreur de publication.')
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Met à jour le statut d'une demande de dépôt (workflow complet).
   * @param {number|string} id - Identifiant du dépôt.
   * @param {string} nextStatus - Nouveau statut.
   * @param {Object} [meta={}] - Métadonnées (commentaire, adminOverride, referenceId, assignedManagerId).
   * @returns {Promise<Object>} Dépôt mis à jour.
   */
  async function updateDepositStatus(id, nextStatus, meta = {}) {
    isSubmitting.value = true
    try {
      // Délègue à approveAndPublish si le statut cible est la publication
      if (nextStatus === 'approved_published') {
        return await approveAndPublish(id)
      }
      // Délègue à assignManager si le statut cible est assigné avec un manager
      if (nextStatus === 'assigned' && meta.assignedManagerId) {
        return await assignManager(id, meta.assignedManagerId)
      }

      await new Promise(r => setTimeout(r, 200))
      const deposit = deposits.value.find(d => String(d.id) === String(id))
      if (!deposit) throw new Error('Demande introuvable.')

      deposit.status = nextStatus
      if (meta.comment) deposit.adminDecisionComment = meta.comment
      if (meta.adminOverride) deposit.adminOverride = true
      if (meta.referenceId) deposit.referenceId = meta.referenceId

      const authStore = useAuthStore()
      const actor = authStore.user ? `${authStore.user.first_name} ${authStore.user.last_name}` : 'Admin System'
      const role = authStore.userRole === 'responsable_demande' ? 'Responsable' : 'Administrateur'
      const actionLabels = {
        pending: 'Soumission', assigned: 'Assignation', manager_approved: 'Approbation responsable',
        manager_rejected: 'Rejet responsable', second_opinion: 'Demande de second avis',
        approved_published: 'Approbation et publication', rejected: 'Rejet définitif',
      }
      _addHistory(deposit, actor, role, actionLabels[nextStatus] || nextStatus, meta.comment || null)
      _updateInStore(id, deposit)

      const toast = useToastStore()
      // Affiche une notification et log selon le statut final
      if (nextStatus === 'rejected') {
        toast.error('❌ Demande rejetée.')
        _addActivityLog(`Rejet de ${id}`, id, 'red')
      } else if (nextStatus === 'second_opinion') {
        toast.info('🟣 Second avis demandé.')
        _addActivityLog(`Second avis pour ${id}`, id, 'purple')
      } else {
        toast.success(`Statut mis à jour : ${actionLabels[nextStatus] || nextStatus}`)
        _addActivityLog(`${actionLabels[nextStatus] || nextStatus} - ${id}`, id)
      }
      _simulateNotification(`La demande ${id} a changé de statut.`)
      return deposit
    } catch (err) {
      useToastStore().error(err.message || 'Erreur lors de la mise à jour.')
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Réassigne une demande à un autre responsable.
   * @param {number|string} id - Identifiant du dépôt.
   * @param {number} managerId - Identifiant du nouveau responsable.
   */
  async function reassignManager(id, managerId) {
    const deposit = deposits.value.find(d => String(d.id) === String(id))
    if (!deposit) return
    // Décrémente le compteur de l'ancien responsable
    const oldMgr = getManagerById(deposit.assignedManagerId)
    if (oldMgr) oldMgr.open_deposits = Math.max(0, (oldMgr.open_deposits || 0) - 1)
    deposit.assignedManagerId = managerId
    deposit.assignedAt = new Date().toISOString()
    // Incrémente le compteur du nouveau responsable
    const newMgr = getManagerById(managerId)
    if (newMgr) newMgr.open_deposits = (newMgr.open_deposits || 0) + 1
    _addHistory(deposit, 'Admin System', 'Administrateur', 'Réassignation', `Réassigné au responsable #${managerId}`)
    _updateInStore(id, deposit)
    useToastStore().success('Demande réassignée.')
    _simulateNotification(`La demande ${id} vous a été réassignée.`)
  }

  /**
   * Annule l'assignation d'une demande.
   * @param {number|string} id - Identifiant du dépôt.
   */
  async function unassignManager(id) {
    const deposit = deposits.value.find(d => String(d.id) === String(id))
    if (!deposit) return
    const mgr = getManagerById(deposit.assignedManagerId)
    if (mgr) mgr.open_deposits = Math.max(0, (mgr.open_deposits || 0) - 1)
    deposit.assignedManagerId = null
    deposit.assignedAt = null
    deposit.status = 'pending'
    _addHistory(deposit, 'Admin System', 'Administrateur', 'Annulation assignation', 'Assignation annulée.')
    _updateInStore(id, deposit)
    useToastStore().info('Assignation annulée.')
  }

  /**
   * Envoie une relance au responsable assigné.
   * @param {number|string} id - Identifiant du dépôt.
   */
  async function remindManager(id) {
    const deposit = deposits.value.find(d => String(d.id) === String(id))
    if (!deposit) return
    _addHistory(deposit, 'Admin System', 'Administrateur', 'Relance responsable', 'Relance envoyée.')
    _updateInStore(id, deposit)
    useToastStore().success('Relance envoyée au responsable.')
    _simulateNotification(`Rappel : la demande ${id} est en attente.`)
  }

  /**
   * Retourne l'étape actuelle dans le workflow pour un statut donné.
   * @param {string} status - Code du statut.
   * @returns {number} Indice de l'étape (ou -1 si négatif).
   */
  function getCurrentStep(status) {
    const normalizedStatus = ({
      approved_by_manager: 'manager_approved', rejected_by_manager: 'manager_rejected',
      second_review: 'second_opinion', approved: 'approved_published', published: 'approved_published',
    })[status] || status
    const cfg = STATUS_LABELS[normalizedStatus]
    if (!cfg || cfg.step < 0) return -1
    if (normalizedStatus === 'approved_published') return 4
    if (normalizedStatus === 'manager_approved' || normalizedStatus === 'second_opinion') return 2
    return cfg.step
  }

  /**
   * Génère la liste des étapes du stepper avec leur état (active, completed, future).
   * @param {string} status - Code du statut actuel.
   * @returns {Array} Étapes enrichies.
   */
  function getStepsForStatus(status) {
    const currentStep = getCurrentStep(status)
    return STEPS.map((s, i) => ({ ...s, active: i === currentStep, completed: i < currentStep, future: i > currentStep }))
  }

  return {
    deposits, currentDeposit, isLoading, isSubmitting, error, activityLogs, pagination, pendingCount,
    getStatusConfig, getTypeLabel, getLanguageLabel, getUserInitials, formatDate, formatDateTime,
    getTimeAgo, getAgingDays, getAgingBadge, getAvailableManagers, getActiveManagers,
    getManagerById, getUserById,
    fetchDeposits, fetchDeposit, updateDepositStatus, assignManager, reassignManager,
    unassignManager, remindManager, approveAndPublish, getCurrentStep, getStepsForStatus,
    STEPS, STATUS_LABELS, ISO_LANGUAGES, DOCUMENT_TYPE_LABELS,
  }
})
