export const TREATMENT_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
}

export const FEATURED_TREATMENT_NAME = "Mourne Rocks Retreat & Recovery"
export const FACIAL_TREATMENT_NAME = "Nourishing & Therapeutic Facial"
export const FEATURED_INTRODUCTION =
  "Our signature two-hour treatment combining therapeutic sports massage, soothing hot stone therapy and a deeply nourishing Neal's Yard Remedies Organic facial. Designed to restore tired muscles, calm the mind and leave you feeling completely refreshed."

export const LEGACY_TREATMENTS = [
  {
    category: "Signature Experiences",
    name: "Neck, Head, and Face Massage",
    description: "Melt away tension and restore a natural glow with a calming massage for the neck, head, and face.",
    featured: false,
    displayOrder: 10,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [
      { label: "60 min", durationMinutes: 60, price: 55, depositAmount: 0, displayOrder: 10 },
      { label: "90 min", durationMinutes: 90, price: 80, depositAmount: 0, displayOrder: 20 },
    ],
  },
  {
    category: "Signature Experiences",
    name: "Back, Neck, and Head with Hot Stone Massage",
    description: "Release tension and calm the mind with soothing hot stones.",
    featured: false,
    displayOrder: 20,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [{ label: "60 min", durationMinutes: 60, price: 65, depositAmount: 0, displayOrder: 10 }],
  },
  {
    category: "Signature Experiences",
    name: "Full Body Massage (Lomi Lomi Inspired)",
    description: "Flowing, rhythmic movements designed to restore balance and relax the body.",
    featured: false,
    displayOrder: 30,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [
      { label: "60 min", durationMinutes: 60, price: 55, depositAmount: 0, displayOrder: 10 },
      { label: "90 min", durationMinutes: 90, price: 80, depositAmount: 0, displayOrder: 20 },
    ],
  },
  {
    category: "Signature Experiences",
    name: "Full Body Hot Stone Massage",
    description: "Deep relaxation using heated stones to ease muscle tension.",
    featured: false,
    displayOrder: 40,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [{ label: "70 min", durationMinutes: 70, price: 70, depositAmount: 0, displayOrder: 10 }],
  },
  {
    category: "Signature Experiences",
    name: "Nurturing Full Body Pregnancy Massage",
    description: "A soothing massage designed to support relaxation and wellbeing during pregnancy.",
    featured: false,
    displayOrder: 50,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [{ label: "70 min", durationMinutes: 70, price: 60, depositAmount: 0, displayOrder: 10 }],
  },
  {
    category: "Specialist Recovery",
    name: "Therapeutic Deep Tissue Full Body Therapy",
    description: "Target deep muscle tension and restore balance. Best for stress and recovery.",
    featured: false,
    displayOrder: 60,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [
      { label: "60 min", durationMinutes: 60, price: 55, depositAmount: 0, displayOrder: 10 },
      { label: "90 min", durationMinutes: 90, price: 80, depositAmount: 0, displayOrder: 20 },
    ],
  },
  {
    category: "Specialist Recovery",
    name: "Sports Massage Therapy",
    description: "Focused treatment to ease muscle tension and support recovery.",
    featured: false,
    displayOrder: 70,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [
      { label: "60 min", durationMinutes: 60, price: 55, depositAmount: 0, displayOrder: 10 },
      { label: "90 min", durationMinutes: 90, price: 80, depositAmount: 0, displayOrder: 20 },
    ],
  },
  {
    category: "Specialist Recovery",
    name: "Myofascial Release Therapy",
    description: "Restorative treatment to release deep tension and improve mobility.",
    featured: false,
    displayOrder: 80,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [
      { label: "60 min", durationMinutes: 60, price: 55, depositAmount: 0, displayOrder: 10 },
      { label: "90 min", durationMinutes: 90, price: 80, depositAmount: 0, displayOrder: 20 },
    ],
  },
  {
    category: "Specialist Recovery",
    name: "Race Day Reset",
    description: "Hot and cold therapy with targeted muscle work for recovery.",
    featured: false,
    displayOrder: 90,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [{ label: "70 min", durationMinutes: 70, price: 70, depositAmount: 0, displayOrder: 10 }],
  },
  {
    category: "Signature Treatment",
    name: "Mourne Recovery Therapy",
    description: "A tailored blend of sports massage and myofascial release for full-body reset.",
    featured: false,
    displayOrder: 100,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [{ label: "90 min", durationMinutes: 90, price: 80, depositAmount: 0, displayOrder: 10 }],
  },
  {
    category: "Signature Treatment",
    name: FEATURED_TREATMENT_NAME,
    description:
      "A restorative two-hour treatment designed to release muscular tension while nourishing the skin and promoting deep relaxation. This signature experience combines a back sports massage with hot stones to ease tightness and stiffness in the back, shoulders, and neck, together with a Nourishing & Therapeutic Facial using Neal's Yard Remedies Organic skincare. The facial includes a cleanse, exfoliation, nourishing mask, gentle facial lymphatic drainage, and therapeutic massage to the face, neck, shoulders, and scalp to help reduce puffiness, release tension, and restore a natural glow. Perfect for those seeking both therapeutic bodywork and a deeply relaxing facial experience in the tranquil surroundings of Retreat by the Mournes.",
    featured: true,
    displayOrder: 110,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [{ label: "2 hours", durationMinutes: 120, price: 115, depositAmount: 0, displayOrder: 10 }],
  },
  {
    category: "Nurture & Restore",
    name: "Gentle Back, Neck, and Head Massage",
    description: "Gentle treatment to ease tension and restore calm.",
    featured: false,
    displayOrder: 120,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [{ label: "60 min", durationMinutes: 60, price: 55, depositAmount: 0, displayOrder: 10 }],
  },
  {
    category: "Nurture & Restore",
    name: "Head & Neck Massage with Essential Oils",
    description: "Calming massage to relax the mind and support restful sleep.",
    featured: false,
    displayOrder: 130,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [{ label: "60 min", durationMinutes: 60, price: 55, depositAmount: 0, displayOrder: 10 }],
  },
  {
    category: "Nurture & Restore",
    name: FACIAL_TREATMENT_NAME,
    description:
      "A deeply relaxing facial designed to nourish your skin while easing tension and promoting overall wellbeing. Using Neal's Yard Remedies Organic skincare, this treatment includes a cleanse, exfoliation, nourishing mask, gentle facial lymphatic drainage, and therapeutic massage to the face, neck, shoulders, and scalp. The extended neck, shoulder, and head massage helps to ease stiffness, release built-up tension, and encourage deep relaxation. Perfect for reducing puffiness, relieving stress, and leaving your skin feeling hydrated, refreshed, and naturally radiant.",
    featured: false,
    displayOrder: 140,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [{ label: "75 min", durationMinutes: 75, price: 75, depositAmount: 0, displayOrder: 10 }],
  },
  {
    category: "Express Rituals",
    name: "Tension Release Back Therapy",
    description: "Quick treatment to relieve back, neck, and shoulder tension.",
    featured: false,
    displayOrder: 150,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [{ label: "30 min", durationMinutes: 30, price: 30, depositAmount: 0, displayOrder: 10 }],
  },
  {
    category: "Express Rituals",
    name: "Revitalizing Head & Face Massage",
    description: "Relaxing treatment to ease tension and refresh your skin.",
    featured: false,
    displayOrder: 160,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [{ label: "30 min", durationMinutes: 30, price: 30, depositAmount: 0, displayOrder: 10 }],
  },
  {
    category: "Express Rituals",
    name: "Grounding Foot Ritual",
    description: "Revives tired feet and restores comfort.",
    featured: false,
    displayOrder: 170,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [{ label: "30 min", durationMinutes: 30, price: 30, depositAmount: 0, displayOrder: 10 }],
  },
  {
    category: "Express Rituals",
    name: "Grounding Hand Ritual",
    description: "Relieves tension in hands and wrists.",
    featured: false,
    displayOrder: 180,
    bookingEnabled: true,
    status: TREATMENT_STATUS.ACTIVE,
    options: [{ label: "30 min", durationMinutes: 30, price: 30, depositAmount: 0, displayOrder: 10 }],
  },
]

export function formatCurrency(value) {
  const numericValue = Number(value ?? 0)
  const hasDecimals = Math.abs(numericValue % 1) > Number.EPSILON

  return `£${numericValue.toFixed(hasDecimals ? 2 : 0)}`
}

export function sortTreatmentOptions(options = []) {
  return [...options].sort((left, right) => {
    if ((left.display_order ?? 0) !== (right.display_order ?? 0)) {
      return (left.display_order ?? 0) - (right.display_order ?? 0)
    }

    return (left.label ?? "").localeCompare(right.label ?? "")
  })
}

export function sortTreatments(treatments = []) {
  return [...treatments].sort((left, right) => {
    if (Boolean(left.featured) !== Boolean(right.featured)) {
      return left.featured ? -1 : 1
    }

    if ((left.display_order ?? 0) !== (right.display_order ?? 0)) {
      return (left.display_order ?? 0) - (right.display_order ?? 0)
    }

    return (left.name ?? "").localeCompare(right.name ?? "")
  })
}

export function normalizeTreatmentRecord(treatment) {
  const options = sortTreatmentOptions(treatment.options ?? treatment.treatment_options ?? []).map((option, index) => ({
    id: option.id ?? `option-${index + 1}`,
    label: option.label ?? `${option.duration_minutes ?? 0} min`,
    duration_minutes: Number(option.duration_minutes ?? option.durationMinutes ?? 0),
    price: Number(option.price ?? 0),
    deposit_amount: Number(option.deposit_amount ?? option.depositAmount ?? 0),
    display_order: Number(option.display_order ?? option.displayOrder ?? index * 10),
  }))

  const primaryOption = options[0] ?? null

  return {
    ...treatment,
    category: treatment.category ?? "General",
    status: treatment.status ?? TREATMENT_STATUS.DRAFT,
    featured: Boolean(treatment.featured),
    booking_enabled: Boolean(treatment.booking_enabled ?? treatment.bookingEnabled),
    display_order: Number(treatment.display_order ?? treatment.displayOrder ?? 0),
    duration_minutes: Number(treatment.duration_minutes ?? treatment.durationMinutes ?? primaryOption?.duration_minutes ?? 0),
    price: Number(treatment.price ?? primaryOption?.price ?? 0),
    deposit_amount: Number(treatment.deposit_amount ?? primaryOption?.deposit_amount ?? 0),
    options,
  }
}

export function mapTreatmentToPublicTreatment(treatment) {
  const normalizedTreatment = normalizeTreatmentRecord(treatment)

  return {
    id: normalizedTreatment.id ?? normalizedTreatment.name,
    category: normalizedTreatment.category,
    name: normalizedTreatment.name,
    description: normalizedTreatment.description,
    featured: normalizedTreatment.featured,
    bookingEnabled: normalizedTreatment.booking_enabled,
    displayOrder: normalizedTreatment.display_order,
    prices: normalizedTreatment.options.map((option) => ({
      id: option.id,
      time: option.label,
      price: formatCurrency(option.price),
      durationMinutes: option.duration_minutes,
      rawPrice: option.price,
    })),
  }
}

export function buildTreatmentsStructuredData(treatments) {
  const publicTreatments = treatments.map(mapTreatmentToPublicTreatment)

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Treatments | Retreat by the Mournes",
      url: "https://www.mourneretreat.co.uk/treatments",
      description:
        "Discover therapeutic massage, sports massage, facials and signature wellness treatments using Neal's Yard Remedies Organic products.",
    },
    {
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      name: "Retreat by the Mournes Treatments",
      itemListElement: publicTreatments.map((treatment) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: treatment.name,
          description: treatment.description,
        },
      })),
    },
  ]
}

export function groupTreatmentsByCategory(treatments) {
  const sortedTreatments = sortTreatments(treatments)
  const groups = []
  const byCategory = new Map()

  sortedTreatments.forEach((treatment) => {
    const category = treatment.category ?? "General"

    if (!byCategory.has(category)) {
      const entry = { category, treatments: [] }
      byCategory.set(category, entry)
      groups.push(entry)
    }

    byCategory.get(category).treatments.push(treatment)
  })

  return groups
}

export function getEmptyTreatmentDraft(defaultDepositAmount = 0) {
  return {
    id: null,
    name: "",
    category: "",
    description: "",
    featured: false,
    booking_enabled: true,
    status: TREATMENT_STATUS.DRAFT,
    display_order: 0,
    published_at: null,
    created_at: null,
    updated_at: null,
    options: [
      {
        id: `draft-option-1`,
        label: "60 min",
        duration_minutes: 60,
        price: 0,
        deposit_amount: Number(defaultDepositAmount ?? 0),
        display_order: 10,
      },
    ],
  }
}

export function validateTreatmentInput(treatment, existingTreatments) {
  const errors = {}
  const normalizedName = treatment.name.trim().toLowerCase()

  if (!treatment.name.trim()) {
    errors.name = "Please enter a treatment name."
  } else if (
    existingTreatments.some(
      (existingTreatment) =>
        existingTreatment.id !== treatment.id && existingTreatment.name.trim().toLowerCase() === normalizedName
    )
  ) {
    errors.name = "Treatment names must be unique."
  }

  if (!treatment.category.trim()) {
    errors.category = "Please enter a category."
  }

  if (!treatment.description.trim()) {
    errors.description = "Please enter a description."
  }

  if (Number.isNaN(Number(treatment.display_order)) || Number(treatment.display_order) < 0) {
    errors.display_order = "Display order must be zero or greater."
  }

  if (!Array.isArray(treatment.options) || treatment.options.length === 0) {
    errors.options = "Add at least one pricing option."
  }

  const optionErrors = treatment.options.map((option) => {
    const entry = {}

    if (!option.label.trim()) {
      entry.label = "Please enter a label."
    }

    if (Number.isNaN(Number(option.duration_minutes)) || Number(option.duration_minutes) <= 0) {
      entry.duration_minutes = "Duration must be greater than zero."
    }

    if (Number.isNaN(Number(option.price)) || Number(option.price) < 0) {
      entry.price = "Price cannot be negative."
    }

    if (Number.isNaN(Number(option.deposit_amount)) || Number(option.deposit_amount) < 0) {
      entry.deposit_amount = "Deposit cannot be negative."
    }

    return entry
  })

  if (optionErrors.some((entry) => Object.keys(entry).length > 0)) {
    errors.optionErrors = optionErrors
  }

  return errors
}

export function buildTreatmentSavePayload(treatment, userId) {
  const normalizedTreatment = normalizeTreatmentRecord(treatment)
  const options = sortTreatmentOptions(normalizedTreatment.options)
  const primaryOption = options[0]

  return {
    treatment: {
      id: normalizedTreatment.id ?? undefined,
      name: normalizedTreatment.name.trim(),
      category: normalizedTreatment.category.trim(),
      description: normalizedTreatment.description.trim(),
      duration_minutes: primaryOption?.duration_minutes ?? 0,
      price: primaryOption?.price ?? 0,
      deposit_amount: primaryOption?.deposit_amount ?? 0,
      featured: normalizedTreatment.featured,
      booking_enabled: normalizedTreatment.booking_enabled,
      status: normalizedTreatment.status,
      display_order: Number(normalizedTreatment.display_order),
      created_by: normalizedTreatment.created_by ?? userId ?? null,
      updated_by: userId ?? normalizedTreatment.updated_by ?? null,
    },
    options: options.map((option, index) => ({
      id: option.id && !String(option.id).startsWith("draft-option-") ? option.id : undefined,
      label: option.label.trim(),
      duration_minutes: Number(option.duration_minutes),
      price: Number(option.price),
      deposit_amount: Number(option.deposit_amount),
      display_order: Number(option.display_order ?? (index + 1) * 10),
    })),
  }
}

