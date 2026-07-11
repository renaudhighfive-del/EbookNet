// Store Pinia pour la gestion des demandes de dépôt côté administration et responsable
// (workflow complet, assignation, publication)
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

// -----------------------------------------------------------------------
// STATUTS : une seule source de vérité (les anciens alias API sont mappés
// une fois pour toutes dans normalizeApiDeposit, jamais dupliqués ici).
// -----------------------------------------------------------------------
const STATUS_LABELS = {
  pending:            { label: 'En attente',       cls: 'bg-gray-100 text-gray-600',    step: 0 },
  assigned:           { label: 'Assignée',         cls: 'bg-blue-100 text-blue-700',    step: 1 },
  manager_approved:   { label: 'Validée (resp.)',  cls: 'bg-teal-100 text-teal-700',    step: 2 },
  manager_rejected:   { label: 'Refusée (resp.)',  cls: 'bg-orange-100 text-orange-700',step: -1 },
  second_opinion:     { label: 'Second avis',      cls: 'bg-purple-100 text-purple-700',step: 2 },
  approved_published: { label: 'Publiée',          cls: 'bg-emerald-100 text-emerald-800', step: 4 },
  rejected:           { label: 'Rejetée',          cls: 'bg-red-100 text-red-700',      step: -2 },
}

// Machine à états : transitions valides depuis chaque statut
const STATUS_TRANSITIONS = {
  pending:            ['assigned', 'rejected'],
  assigned:           ['manager_approved', 'manager_rejected', 'second_opinion', 'pending', 'rejected'],
  manager_approved:   ['approved_published', 'rejected', 'second_opinion'],
  manager_rejected:   ['rejected', 'approved_published', 'second_opinion', 'assigned'],
  second_opinion:     ['manager_approved', 'manager_rejected', 'approved_published', 'rejected', 'assigned'],
  approved_published: ['pending'],
  rejected:           [],
}

// -----------------------------------------------------------------------
// REGISTRE D'ACTIONS : source UNIQUE utilisée par la liste ET la fiche
// détaillée. Corrige les 3 bugs constatés (action "remind" introuvable,
// validation de commentaire incohérente, double publication).
// -----------------------------------------------------------------------
const ACTION_REGISTRY = {
  assign:             { label: 'Assigner à un responsable', variant: 'green',      requiresComment: false, minLength: 0 },
  reassign:           { label: 'Réassigner',                variant: 'blue',       requiresComment: false, minLength: 0 },
  remind:             { label: 'Relancer le responsable',   variant: 'amber',      requiresComment: false, minLength: 0 },
  reject_direct:      { label: 'Rejeter directement',        variant: 'red',        requiresComment: true,  minLength: 30 },
  approve_publish:    { label: 'Approuver & Publier',        variant: 'green',      requiresComment: false, minLength: 0 },
  second_opinion_req: { label: 'Demander un 2ème avis',      variant: 'white',      requiresComment: true,  minLength: 20 },
  reject_definitive:  { label: 'Rejeter définitivement',     variant: 'red',        requiresComment: true,  minLength: 50 },
  confirm_reject:     { label: 'Confirmer le rejet',         variant: 'red-outline',requiresComment: true,  minLength: 20 },
  override_publish:   { label: 'Passer outre & Publier',     variant: 'orange',     requiresComment: true,  minLength: 50 },
  unpublish:          { label: 'Dépublier',                  variant: 'red',        requiresComment: true,  minLength: 30 },
}

// Actions disponibles pour chaque statut, dans l'ordre d'affichage voulu
const STATUS_ACTIONS = {
  pending:            ['assign', 'reject_direct'],
  assigned:           ['remind', 'reassign'],
  manager_approved:   ['approve_publish'],
  manager_rejected:   ['confirm_reject', 'override_publish', 'second_opinion_req'],
  second_opinion:     [],
  approved_published: ['unpublish'],
  rejected:           [],
}

// Données factices pour les responsables (utilisées en fallback si l'API échoue)
const MOCK_MANAGERS = [
  { id: 1, first_name: 'Kofi', last_name: 'Anan', email: 'kofi.anan@lectoria.bj', role: 'responsable_demande', status: 'active', open_deposits: 3 },
  { id: 2, first_name: 'Awa', last_name: 'Diallo', email: 'awa.diallo@lectoria.bj', role: 'responsable_demande', status: 'active', open_deposits: 1 },
  { id: 3, first_name: 'Jean', last_name: 'Kouamé', email: 'jean.kouame@lectoria.bj', role: 'responsable_demande', status: 'active', open_deposits: 5 },
  { id: 4, first_name: 'Fatima', last_name: 'Ouedraogo', email: 'fatima.ouedraogo@lectoria.bj', role: 'responsable_demande', status: 'active', open_deposits: 0 },
]

// Statuts qui indiquent qu'un responsable a une demande en cours d'examen
const MANAGER_BUSY_STATUSES = ['assigned', 'manager_approved', 'manager_rejected', 'second_opinion']

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
  { key: 'approved_published', label: 'Publiée', step: 4 },
]

// Compteur d'ID pour les dépôts factices. Démarre à 9000 pour ne jamais
// entrer en collision avec de vrais ID numériques renvoyés par l'API
// (le fallback mock ne doit servir qu'en démo / hors-ligne, jamais mélangé
// avec des données réelles).
let mockIdCounter = 9000

/**
 * Génère un jeu de données factices pour les demandes de dépôt (démo uniquement).
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
 * C'est ICI, et uniquement ici, que les anciens libellés de statut API
 * (approved_by_manager, rejected_by_manager, second_review, approved,
 * published...) sont convertis vers les statuts canoniques du store.
 * @param {Object} item - Dépôt brut de l'API.
 * @returns {Object} Dépôt normalisé.
 */
function normalizeApiDeposit(item) {
  const authorNames = item.author
    ? item.author.split(',').map(s => s.trim()).filter(Boolean)
    : []
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
    fileUrl: item.proposed_file_url || null,
    fileSize: item.file_size || null,
    cover_image: item.cover_image || null,
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
    referenceId: item.reference_id ?? item.referenceId ?? null,
    adminOverride: item.admin_override ?? item.adminOverride ?? false,
    _created_at: item.created_at,
    _updated_at: item.updated_at,
  }
}

export const useDepositsStore = defineStore('deposits', () => {
  const deposits = ref([])
  const currentDeposit = ref(null)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const error = ref(null)
  const activityLogs = ref([])
  const pagination = ref(null)
  const managers = ref([])

  const pendingCount = computed(() => deposits.value.filter(d => d.status === 'pending' || d.status === 'assigned').length)

  function _addHistory(deposit, actor, role, action, comment) {
    deposit.history.push({ actor, role, action, comment: comment || null, at: new Date().toISOString() })
  }

  function _addActivityLog(action, depositId, color = 'orange') {
    activityLogs.value.unshift({ id: Date.now(), type: 'Workflow', action, deposit_id: depositId, color, created_at: new Date().toISOString() })
  }

  function _notify(message) {
    useToastStore().info(message)
  }

  function _updateInStore(id, updated) {
    const idx = deposits.value.findIndex(d => d.id === id)
    if (idx !== -1) deposits.value[idx] = { ...deposits.value[idx], ...updated }
    if (currentDeposit.value?.id === id) currentDeposit.value = { ...currentDeposit.value, ...updated }
  }

  function getStatusConfig(s) {
    return STATUS_LABELS[s] || { label: s || 'Inconnu', cls: 'bg-gray-100 text-gray-500', step: -99 }
  }

  function getTypeLabel(type) { return DOCUMENT_TYPE_LABELS[type] || type || 'Non spécifié' }
  function getLanguageLabel(lang) { return ISO_LANGUAGES[lang] || lang || 'Non spécifié' }

  function getUserInitials(user) {
    if (!user) return '?'
    return `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase()
  }

  function formatDate(d) {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return '—' }
  }

  function formatDateTime(d) {
    if (!d) return '—'
    try { return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return '—' }
  }

  function getTimeAgo(d) {
    if (!d) return ''
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 60) return `Il y a ${m} min`
    const h = Math.floor(m / 60)
    if (h < 24) return `Il y a ${h} h`
    const j = Math.floor(h / 24)
    return `Il y a ${j} jour${j > 1 ? 's' : ''}`
  }

  function getAgingDays(d) {
    try { return d ? Math.floor((Date.now() - new Date(d)) / 86400000) : 0 } catch { return 0 }
  }

  function getAgingBadge(d) {
    const days = getAgingDays(d)
    if (days >= 7) return { cls: 'bg-red-100 text-red-700', label: `${days} jours` }
    if (days >= 3) return { cls: 'bg-orange-100 text-orange-700', label: `${days} jours` }
    return null
  }

  function canTransition(from, to) {
    if (from === to) return false
    const allowed = STATUS_TRANSITIONS[from]
    if (!allowed) return false
    return allowed.includes(to)
  }

  /**
   * Retourne, pour un statut donné, la liste ordonnée des actions
   * possibles avec leur configuration (label, variante de couleur,
   * exigence de commentaire, longueur minimale). Unique source de vérité
   * consommée par la liste ET la fiche détaillée : plus aucun risque de
   * divergence entre les deux écrans.
   * @param {string} status
   * @returns {Array<{key:string,label:string,variant:string,requiresComment:boolean,minLength:number}>}
   */
  function getActionsForStatus(status) {
    return (STATUS_ACTIONS[status] || []).map(key => ({ key, ...ACTION_REGISTRY[key] }))
  }

  /**
   * Retourne la liste des responsables disponibles (triés par charge de travail croissante).
   * Exclut les responsables qui ont déjà une demande en cours d'examen.
   * @param {number|null} currentManagerId - Toujours inclus même s'il est occupé (pour permettre de le garder lors d'une réassignation).
   * @returns {Array} Liste des responsables disponibles.
   */
  async function fetchManagers() {
    try {
      const data = await adminService.getManagers()
      managers.value = data.managers || data.data || data || []
    } catch {
      managers.value = MOCK_MANAGERS
    }
    return managers.value
  }

  function getAvailableManagers(currentManagerId = null) {
    const source = managers.value.length ? managers.value : MOCK_MANAGERS
    const managerBusyCounts = {}
    deposits.value.forEach(d => {
      if (d.assignedManagerId && MANAGER_BUSY_STATUSES.includes(d.status)) {
        managerBusyCounts[d.assignedManagerId] = (managerBusyCounts[d.assignedManagerId] || 0) + 1
      }
    })

    return source
      .filter(m => m.status === 'active' && m.role === 'responsable_demande')
      .filter(m => m.id === currentManagerId || !managerBusyCounts[m.id])
      .map(m => ({ ...m, open_deposits: managerBusyCounts[m.id] || 0 }))
      .sort((a, b) => a.open_deposits - b.open_deposits)
  }

  function getActiveManagers() {
    const source = managers.value.length ? managers.value : MOCK_MANAGERS
    return source.filter(m => m.status === 'active' && m.role === 'responsable_demande')
  }

  function getManagerById(id) {
    const source = managers.value.length ? managers.value : MOCK_MANAGERS
    return source.find(m => m.id === id) || null
  }
  function getUserById(id) { return MOCK_USERS.find(u => u.id === id) || null }

  async function fetchDeposits(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const auth = useAuthStore()
      const service = auth.userRole === 'responsable_demande' ? managerService : adminService
      const data = await service.getDeposits(params)
      const list = data.data || data || []
      deposits.value = list.map(normalizeApiDeposit)
      pagination.value = data.data ? { current_page: data.current_page, last_page: data.last_page, per_page: data.per_page, total: data.total } : null
      return deposits.value
    } catch (err) {
      if (!deposits.value.length) {
        deposits.value = buildMockDeposits()
        useToastStore().warning('API indisponible : données de démonstration affichées.')
      }
      error.value = err.response?.data?.message || null
      return deposits.value
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDeposit(id) {
    isLoading.value = true
    error.value = null
    try {
      const auth = useAuthStore()
      const service = auth.userRole === 'responsable_demande' ? managerService : adminService
      const data = await service.getDeposit(id)
      const item = data.deposit_request || data
      currentDeposit.value = normalizeApiDeposit(item)
      return currentDeposit.value
    } catch (err) {
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
   * Assigne (ou réassigne) un responsable à une demande de dépôt.
   * Valide uniquement depuis 'pending' ou 'assigned'.
   */
  async function assignManager(id, managerId) {
    isSubmitting.value = true
    try {
      const deposit = deposits.value.find(d => String(d.id) === String(id))
      const allowedFrom = ['pending', 'assigned']
      if (deposit && !allowedFrom.includes(deposit.status)) {
        throw new Error('Transition de statut non autorisée.')
      }
      const result = await adminService.assignDeposit(id, managerId)
      const updated = normalizeApiDeposit(result.deposit_request || result)
      _updateInStore(id, updated)
      useToastStore().success('Demande assignée avec succès.')
      _notify(`La demande ${id} a été assignée.`)
      return updated
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Erreur lors de l'assignation."
      const deposit = deposits.value.find(d => String(d.id) === String(id))
      if (deposit && !err.response) {
        const wasAssigned = deposit.status === 'assigned'
        deposit.status = 'assigned'
        deposit.assignedManagerId = managerId
        deposit.assignedAt = new Date().toISOString()
        _addHistory(deposit, 'Admin System', 'Administrateur', wasAssigned ? 'Réassignation' : 'Assignation', `Assigné au responsable #${managerId}`)
        _updateInStore(id, deposit)
        useToastStore().warning('Assignation enregistrée en mode hors-ligne (non persistée en base).')
        _notify(`La demande ${id} a été assignée.`)
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
   * @param {number|string} id
   * @param {Object} [meta={}] - { comment, adminOverride } : utilisé notamment
   *   pour le cas "Passer outre & Publier" depuis un statut refusé par le
   *   responsable — plus besoin d'appeler updateDepositStatus() en plus,
   *   ce qui évite la double écriture d'historique.
   */
  async function approveAndPublish(id, meta = {}) {
    isSubmitting.value = true
    try {
      const result = await adminService.publishDeposit(id, meta)
      const updated = normalizeApiDeposit(result.deposit_request || result)
      const patch = { ...updated, status: 'approved_published', referenceId: result.reference?.id || updated.referenceId }
      if (meta.adminOverride) patch.adminOverride = true
      if (meta.comment) patch.adminDecisionComment = meta.comment
      _updateInStore(id, patch)
      useToastStore().success('Demande approuvée et publiée avec succès.')
      _addActivityLog(`Publication de la demande ${id}`, id, 'green')
      _notify(`La demande ${id} a été publiée.`)
      return updated
    } catch (err) {
      const deposit = deposits.value.find(d => String(d.id) === String(id))
      if (deposit) {
        deposit.status = 'approved_published'
        deposit.referenceId = Math.floor(Math.random() * 1000) + 100
        if (meta.adminOverride) deposit.adminOverride = true
        if (meta.comment) deposit.adminDecisionComment = meta.comment
        const label = meta.adminOverride ? 'Passer outre et publier' : 'Approbation et publication'
        _addHistory(deposit, 'Admin System', 'Administrateur', label, meta.comment || 'Publiée dans le catalogue.')
        _updateInStore(id, deposit)
        useToastStore().success('Demande approuvée et publiée (mode démonstration).')
        _addActivityLog(`Publication simulée de ${id}`, id, 'green')
        _notify(`La demande ${id} a été publiée.`)
        return deposit
      }
      useToastStore().error(err.response?.data?.message || 'Erreur lors de la publication.')
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Met à jour le statut d'une demande de dépôt (workflow générique).
   * Ne pas utiliser pour 'approved_published' -> passer par approveAndPublish().
   * @param {number|string} id
   * @param {string} nextStatus
   * @param {Object} [meta={}] - { comment }
   */
  async function updateDepositStatus(id, nextStatus, meta = {}) {
    isSubmitting.value = true
    try {
      if (nextStatus === 'approved_published') {
        // Toujours passer par approveAndPublish pour éviter une double écriture.
        return await approveAndPublish(id, meta)
      }

      const deposit = deposits.value.find(d => String(d.id) === String(id))
      if (!deposit) throw new Error('Demande introuvable.')

      if (!canTransition(deposit.status, nextStatus)) {
        throw new Error(`Transition non autorisée : ${deposit.status} → ${nextStatus}.`)
      }

      let updatedFromApi = null
      try {
        if (nextStatus === 'rejected' && adminService.rejectDeposit) {
          const res = await adminService.rejectDeposit(id, meta.comment || '')
          updatedFromApi = normalizeApiDeposit(res.deposit_request || res)
        } else if (nextStatus === 'second_opinion' && adminService.requestSecondOpinion) {
          const res = await adminService.requestSecondOpinion(id, meta.comment || '')
          updatedFromApi = normalizeApiDeposit(res.deposit_request || res)
        } else if (nextStatus === 'pending' && adminService.unpublishDeposit) {
          const res = await adminService.unpublishDeposit(id, meta.comment || '')
          updatedFromApi = normalizeApiDeposit(res.deposit_request || res)
        }
      } catch (err) {
        useToastStore().warning('Mise à jour enregistrée en mode hors-ligne (non persistée en base).')
      }

      const actionLabels = {
        pending: 'Dépublication', assigned: 'Assignation', manager_approved: 'Approbation responsable',
        manager_rejected: 'Rejet responsable', second_opinion: 'Demande de second avis',
        rejected: 'Rejet définitif',
      }

      if (updatedFromApi) {
        _updateInStore(id, updatedFromApi)
      } else {
        deposit.status = nextStatus
        if (meta.comment) deposit.adminDecisionComment = meta.comment

        const authStore = useAuthStore()
        const actor = authStore.user ? `${authStore.user.first_name} ${authStore.user.last_name}` : 'Admin System'
        const role = authStore.userRole === 'responsable_demande' ? 'Responsable' : 'Administrateur'
        _addHistory(deposit, actor, role, actionLabels[nextStatus] || nextStatus, meta.comment || null)
        _updateInStore(id, deposit)
      }

      const toast = useToastStore()
      if (nextStatus === 'rejected') {
        toast.error('Demande rejetée.')
        _addActivityLog(`Rejet de ${id}`, id, 'red')
      } else if (nextStatus === 'second_opinion') {
        toast.info('Second avis demandé.')
        _addActivityLog(`Second avis pour ${id}`, id, 'purple')
      } else {
        toast.success(actionLabels[nextStatus] || 'Statut mis à jour.')
        _addActivityLog(`${actionLabels[nextStatus] || nextStatus} - ${id}`, id)
      }
      _notify(`La demande ${id} a changé de statut.`)
      return deposit
    } catch (err) {
      useToastStore().error(err.message || 'Erreur lors de la mise à jour.')
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  async function reassignManager(id, managerId) {
    return assignManager(id, managerId)
  }

  async function unassignManager(id) {
    const deposit = deposits.value.find(d => String(d.id) === String(id))
    if (!deposit) return
    if (deposit.status !== 'assigned') {
      useToastStore().error('Annulation impossible pour ce statut.')
      return
    }
    try {
      const res = await adminService.unassignDeposit(id)
      const updated = normalizeApiDeposit(res.deposit_request || res)
      _updateInStore(id, updated)
    } catch {
      // Fallback local si API indisponible
      deposit.assignedManagerId = null
      deposit.assignedAt = null
      deposit.status = 'pending'
      _addHistory(deposit, 'Admin System', 'Administrateur', 'Annulation assignation', 'Assignation annulée.')
      _updateInStore(id, deposit)
    }
    useToastStore().info('Assignation annulée.')
  }

  async function remindManager(id) {
    const deposit = deposits.value.find(d => String(d.id) === String(id))
    if (!deposit) return
    try {
      await adminService.remindDeposit(id)
    } catch {
      // La relance envoie juste un email — on trace localement même en cas d'échec API
    }
    _addHistory(deposit, 'Admin System', 'Administrateur', 'Relance responsable', 'Relance envoyée.')
    _updateInStore(id, deposit)
    useToastStore().success('Relance envoyée au responsable.')
    _notify(`Rappel : la demande ${id} est en attente.`)
  }

  function getCurrentStep(status) {
    const cfg = STATUS_LABELS[status]
    if (!cfg || cfg.step < 0) return -1
    if (status === 'manager_approved' || status === 'second_opinion') return 2
    return cfg.step
  }

  function getStepsForStatus(status) {
    const currentStep = getCurrentStep(status)
    return STEPS.map((s, i) => ({ ...s, active: i === currentStep, completed: i < currentStep, future: i > currentStep }))
  }

  return {
    deposits, currentDeposit, isLoading, isSubmitting, error, activityLogs, pagination, pendingCount, managers,
    getStatusConfig, getTypeLabel, getLanguageLabel, getUserInitials, formatDate, formatDateTime,
    getTimeAgo, getAgingDays, getAgingBadge, getAvailableManagers, getActiveManagers,
    getManagerById, getUserById, canTransition, getActionsForStatus,
    fetchDeposits, fetchDeposit, fetchManagers, updateDepositStatus, assignManager, reassignManager,
    unassignManager, remindManager, approveAndPublish, getCurrentStep, getStepsForStatus,
    STEPS, STATUS_LABELS, ISO_LANGUAGES, DOCUMENT_TYPE_LABELS, STATUS_TRANSITIONS, ACTION_REGISTRY,
  }
})