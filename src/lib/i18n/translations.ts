
export type Language = "en" | "sw" | "fr" | "es" | "zh";

interface Translation {
  app: {
    name: string;
    tagline: string;
  };
  nav: {
    home: string;
    feeding: string;
    diaper: string;
    sleep: string;
    health: string;
    milestones: string;
    settings: string;
  };
  dashboard: {
    today: string;
    last24h: string;
    todaySummary: string;
    recentFeedings: string;
    recentDiapers: string;
    recentSleep: string;
    addNew: string;
  };
  feeding: {
    title: string;
    newFeeding: string;
    type: string;
    breastLeft: string;
    breastRight: string;
    bottle: string;
    formula: string;
    solid: string;
    startTime: string;
    endTime: string;
    duration: string;
    amount: string;
    unit: string;
    note: string;
    save: string;
    cancel: string;
  };
  diaper: {
    title: string;
    newDiaper: string;
    type: string;
    wet: string;
    dirty: string;
    mixed: string;
    time: string;
    note: string;
    save: string;
    cancel: string;
  };
  sleep: {
    title: string;
    newSleep: string;
    type: string;
    nap: string;
    night: string;
    startTime: string;
    endTime: string;
    duration: string;
    location: string;
    mood: string;
    moods: {
      happy: string;
      fussy: string;
      calm: string;
      crying: string;
    };
    note: string;
    save: string;
    cancel: string;
  };
  health: {
    title: string;
    growth: string;
    vaccinations: string;
    records: string;
    weight: string;
    height: string;
    headCircumference: string;
    addGrowth: string;
    addVaccination: string;
    addRecord: string;
    date: string;
    name: string;
    nextDueDate: string;
    batchNumber: string;
    type: string;
    value: string;
    medication: string;
    dosage: string;
    note: string;
    save: string;
    cancel: string;
  };
  milestone: {
    title: string;
    newMilestone: string;
    date: string;
    description: string;
    category: string;
    addPhoto: string;
    save: string;
    cancel: string;
  };
  settings: {
    title: string;
    language: string;
    units: string;
    metric: string;
    imperial: string;
    notifications: string;
    theme: string;
    light: string;
    dark: string;
    system: string;
    export: string;
    about: string;
    logout: string;
  };
  time: {
    now: string;
    min: string;
    hour: string;
    day: string;
    ago: string;
  };
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    yes: string;
    no: string;
  };
}

const en: Translation = {
  app: {
    name: "BabyCare Daily",
    tagline: "The simplest, smartest way for parents to track their baby's routines",
  },
  nav: {
    home: "Home",
    feeding: "Feeding",
    diaper: "Diaper",
    sleep: "Sleep",
    health: "Health",
    milestones: "Milestones",
    settings: "Settings",
  },
  dashboard: {
    today: "Today",
    last24h: "Last 24 hours",
    todaySummary: "Today's Summary",
    recentFeedings: "Recent Feedings",
    recentDiapers: "Recent Diapers",
    recentSleep: "Recent Sleep",
    addNew: "Add New",
  },
  feeding: {
    title: "Feedings",
    newFeeding: "New Feeding",
    type: "Type",
    breastLeft: "Breast Left",
    breastRight: "Breast Right",
    bottle: "Bottle",
    formula: "Formula",
    solid: "Solid Food",
    startTime: "Start Time",
    endTime: "End Time",
    duration: "Duration",
    amount: "Amount",
    unit: "ml/oz",
    note: "Note",
    save: "Save",
    cancel: "Cancel",
  },
  diaper: {
    title: "Diapers",
    newDiaper: "New Diaper Change",
    type: "Type",
    wet: "Wet",
    dirty: "Dirty",
    mixed: "Mixed",
    time: "Time",
    note: "Note",
    save: "Save",
    cancel: "Cancel",
  },
  sleep: {
    title: "Sleep",
    newSleep: "New Sleep",
    type: "Type",
    nap: "Nap",
    night: "Night",
    startTime: "Start Time",
    endTime: "End Time",
    duration: "Duration",
    location: "Location",
    mood: "Mood",
    moods: {
      happy: "Happy",
      fussy: "Fussy",
      calm: "Calm",
      crying: "Crying",
    },
    note: "Note",
    save: "Save",
    cancel: "Cancel",
  },
  health: {
    title: "Health",
    growth: "Growth",
    vaccinations: "Vaccinations",
    records: "Health Records",
    weight: "Weight",
    height: "Height",
    headCircumference: "Head Circumference",
    addGrowth: "Add Growth Record",
    addVaccination: "Add Vaccination",
    addRecord: "Add Health Record",
    date: "Date",
    name: "Name",
    nextDueDate: "Next Due Date",
    batchNumber: "Batch Number",
    type: "Type",
    value: "Value",
    medication: "Medication",
    dosage: "Dosage",
    note: "Note",
    save: "Save",
    cancel: "Cancel",
  },
  milestone: {
    title: "Milestones",
    newMilestone: "New Milestone",
    date: "Date",
    description: "Description",
    category: "Category",
    addPhoto: "Add Photo",
    save: "Save",
    cancel: "Cancel",
  },
  settings: {
    title: "Settings",
    language: "Language",
    units: "Units",
    metric: "Metric",
    imperial: "Imperial",
    notifications: "Notifications",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    export: "Export Data",
    about: "About",
    logout: "Log Out",
  },
  time: {
    now: "Just now",
    min: "min",
    hour: "h",
    day: "d",
    ago: "ago",
  },
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    yes: "Yes",
    no: "No",
  },
};

// Basic translations for demonstration
const sw: Translation = {
  app: {
    name: "BabyCare Daily",
    tagline: "Njia rahisi na mahiri kwa wazazi kufuatilia mipango ya mtoto wao",
  },
  nav: {
    home: "Nyumbani",
    feeding: "Kulisha",
    diaper: "Nepi",
    sleep: "Usingizi",
    health: "Afya",
    milestones: "Maendeleo",
    settings: "Mipangilio",
  },
  dashboard: {
    today: "Leo",
    last24h: "Saa 24 zilizopita",
    todaySummary: "Muhtasari wa Leo",
    recentFeedings: "Ulishaji wa Hivi Karibuni",
    recentDiapers: "Nepi za Hivi Karibuni",
    recentSleep: "Usingizi wa Hivi Karibuni",
    addNew: "Ongeza",
  },
  feeding: {
    title: "Ulishaji",
    newFeeding: "Ulishaji Mpya",
    type: "Aina",
    breastLeft: "Titi la Kushoto",
    breastRight: "Titi la Kulia",
    bottle: "Chupa",
    formula: "Formula",
    solid: "Chakula Kigumu",
    startTime: "Wakati wa Kuanza",
    endTime: "Wakati wa Kumaliza",
    duration: "Muda",
    amount: "Kiasi",
    unit: "ml/oz",
    note: "Maelezo",
    save: "Hifadhi",
    cancel: "Ghairi",
  },
  diaper: {
    title: "Nepi",
    newDiaper: "Nepi Mpya",
    type: "Aina",
    wet: "Mrinyaji",
    dirty: "Chafu",
    mixed: "Mchanganyiko",
    time: "Wakati",
    note: "Maelezo",
    save: "Hifadhi",
    cancel: "Ghairi",
  },
  sleep: {
    title: "Usingizi",
    newSleep: "Usingizi Mpya",
    type: "Aina",
    nap: "Sinzia",
    night: "Usiku",
    startTime: "Wakati wa Kuanza",
    endTime: "Wakati wa Kumaliza",
    duration: "Muda",
    location: "Mahali",
    mood: "Hali ya Mtoto",
    moods: {
      happy: "Furaha",
      fussy: "Usumbufu",
      calm: "Tulivu",
      crying: "Analia",
    },
    note: "Maelezo",
    save: "Hifadhi",
    cancel: "Ghairi",
  },
  health: {
    title: "Afya",
    growth: "Ukuaji",
    vaccinations: "Chanjo",
    records: "Rekodi za Afya",
    weight: "Uzito",
    height: "Urefu",
    headCircumference: "Mzunguko wa Kichwa",
    addGrowth: "Ongeza Rekodi ya Ukuaji",
    addVaccination: "Ongeza Chanjo",
    addRecord: "Ongeza Rekodi ya Afya",
    date: "Tarehe",
    name: "Jina",
    nextDueDate: "Tarehe ya Chanjo Ijayo",
    batchNumber: "Nambari ya Kifurushi",
    type: "Aina",
    value: "Thamani",
    medication: "Dawa",
    dosage: "Kipimo",
    note: "Maelezo",
    save: "Hifadhi",
    cancel: "Ghairi",
  },
  milestone: {
    title: "Maendeleo",
    newMilestone: "Endeleo Jipya",
    date: "Tarehe",
    description: "Maelezo",
    category: "Kategoria",
    addPhoto: "Ongeza Picha",
    save: "Hifadhi",
    cancel: "Ghairi",
  },
  settings: {
    title: "Mipangilio",
    language: "Lugha",
    units: "Vipimo",
    metric: "Metric",
    imperial: "Imperial",
    notifications: "Arifa",
    theme: "Mandhari",
    light: "Mwangaza",
    dark: "Giza",
    system: "Mfumo",
    export: "Hamisha Data",
    about: "Kuhusu",
    logout: "Ondoka",
  },
  time: {
    now: "Sasa hivi",
    min: "dk",
    hour: "saa",
    day: "siku",
    ago: "iliyopita",
  },
  common: {
    loading: "Inapakia...",
    save: "Hifadhi",
    cancel: "Ghairi",
    delete: "Futa",
    edit: "Hariri",
    add: "Ongeza",
    yes: "Ndio",
    no: "La",
  },
};

const fr: Translation = {
  app: {
    name: "BabyCare Daily",
    tagline: "La façon la plus simple et intelligente pour les parents de suivre les routines de leur bébé",
  },
  nav: {
    home: "Accueil",
    feeding: "Alimentation",
    diaper: "Couche",
    sleep: "Sommeil",
    health: "Santé",
    milestones: "Étapes",
    settings: "Paramètres",
  },
  dashboard: {
    today: "Aujourd'hui",
    last24h: "Dernières 24h",
    todaySummary: "Résumé du jour",
    recentFeedings: "Alimentations récentes",
    recentDiapers: "Couches récentes",
    recentSleep: "Sommeil récent",
    addNew: "Ajouter",
  },
  feeding: {
    title: "Alimentations",
    newFeeding: "Nouvelle alimentation",
    type: "Type",
    breastLeft: "Sein gauche",
    breastRight: "Sein droit",
    bottle: "Biberon",
    formula: "Préparation",
    solid: "Solide",
    startTime: "Heure début",
    endTime: "Heure fin",
    duration: "Durée",
    amount: "Quantité",
    unit: "ml/oz",
    note: "Note",
    save: "Sauvegarder",
    cancel: "Annuler",
  },
  diaper: {
    title: "Couches",
    newDiaper: "Nouvelle couche",
    type: "Type",
    wet: "Mouillée",
    dirty: "Selle",
    mixed: "Mixte",
    time: "Heure",
    note: "Note",
    save: "Sauvegarder",
    cancel: "Annuler",
  },
  sleep: {
    title: "Sommeil",
    newSleep: "Nouveau sommeil",
    type: "Type",
    nap: "Sieste",
    night: "Nuit",
    startTime: "Heure début",
    endTime: "Heure fin",
    duration: "Durée",
    location: "Lieu",
    mood: "Humeur",
    moods: {
      happy: "Content",
      fussy: "Agité",
      calm: "Calme",
      crying: "Pleurs",
    },
    note: "Note",
    save: "Sauvegarder",
    cancel: "Annuler",
  },
  health: {
    title: "Santé",
    growth: "Croissance",
    vaccinations: "Vaccins",
    records: "Dossiers",
    weight: "Poids",
    height: "Taille",
    headCircumference: "Tour de tête",
    addGrowth: "Ajouter croissance",
    addVaccination: "Ajouter vaccin",
    addRecord: "Ajouter dossier",
    date: "Date",
    name: "Nom",
    nextDueDate: "Prochaine dose",
    batchNumber: "No. de lot",
    type: "Type",
    value: "Valeur",
    medication: "Médicament",
    dosage: "Dosage",
    note: "Note",
    save: "Sauvegarder",
    cancel: "Annuler",
  },
  milestone: {
    title: "Étapes",
    newMilestone: "Nouvelle étape",
    date: "Date",
    description: "Description",
    category: "Catégorie",
    addPhoto: "Ajouter photo",
    save: "Sauvegarder",
    cancel: "Annuler",
  },
  settings: {
    title: "Paramètres",
    language: "Langue",
    units: "Unités",
    metric: "Métrique",
    imperial: "Impérial",
    notifications: "Notifications",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    system: "Système",
    export: "Exporter",
    about: "À propos",
    logout: "Déconnexion",
  },
  time: {
    now: "À l'instant",
    min: "min",
    hour: "h",
    day: "j",
    ago: "",
  },
  common: {
    loading: "Chargement...",
    save: "Sauvegarder",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    yes: "Oui",
    no: "Non",
  },
};

const es: Translation = {
  app: {
    name: "BabyCare Daily",
    tagline: "La forma más simple e inteligente para que los padres controlen las rutinas de su bebé",
  },
  nav: {
    home: "Inicio",
    feeding: "Alimentación",
    diaper: "Pañal",
    sleep: "Sueño",
    health: "Salud",
    milestones: "Hitos",
    settings: "Ajustes",
  },
  dashboard: {
    today: "Hoy",
    last24h: "Últimas 24h",
    todaySummary: "Resumen de hoy",
    recentFeedings: "Alimentaciones recientes",
    recentDiapers: "Pañales recientes",
    recentSleep: "Sueño reciente",
    addNew: "Añadir",
  },
  feeding: {
    title: "Alimentaciones",
    newFeeding: "Nueva alimentación",
    type: "Tipo",
    breastLeft: "Pecho izquierdo",
    breastRight: "Pecho derecho",
    bottle: "Biberón",
    formula: "Fórmula",
    solid: "Sólido",
    startTime: "Hora inicio",
    endTime: "Hora fin",
    duration: "Duración",
    amount: "Cantidad",
    unit: "ml/oz",
    note: "Nota",
    save: "Guardar",
    cancel: "Cancelar",
  },
  diaper: {
    title: "Pañales",
    newDiaper: "Nuevo pañal",
    type: "Tipo",
    wet: "Mojado",
    dirty: "Sucio",
    mixed: "Mixto",
    time: "Hora",
    note: "Nota",
    save: "Guardar",
    cancel: "Cancelar",
  },
  sleep: {
    title: "Sueño",
    newSleep: "Nuevo sueño",
    type: "Tipo",
    nap: "Siesta",
    night: "Noche",
    startTime: "Hora inicio",
    endTime: "Hora fin",
    duration: "Duración",
    location: "Lugar",
    mood: "Humor",
    moods: {
      happy: "Feliz",
      fussy: "Irritable",
      calm: "Calmado",
      crying: "Llorando",
    },
    note: "Nota",
    save: "Guardar",
    cancel: "Cancelar",
  },
  health: {
    title: "Salud",
    growth: "Crecimiento",
    vaccinations: "Vacunas",
    records: "Registros",
    weight: "Peso",
    height: "Altura",
    headCircumference: "Circunferencia de cabeza",
    addGrowth: "Añadir crecimiento",
    addVaccination: "Añadir vacuna",
    addRecord: "Añadir registro",
    date: "Fecha",
    name: "Nombre",
    nextDueDate: "Próxima fecha",
    batchNumber: "No. de lote",
    type: "Tipo",
    value: "Valor",
    medication: "Medicamento",
    dosage: "Dosis",
    note: "Nota",
    save: "Guardar",
    cancel: "Cancelar",
  },
  milestone: {
    title: "Hitos",
    newMilestone: "Nuevo hito",
    date: "Fecha",
    description: "Descripción",
    category: "Categoría",
    addPhoto: "Añadir foto",
    save: "Guardar",
    cancel: "Cancelar",
  },
  settings: {
    title: "Ajustes",
    language: "Idioma",
    units: "Unidades",
    metric: "Métrico",
    imperial: "Imperial",
    notifications: "Notificaciones",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
    export: "Exportar",
    about: "Acerca de",
    logout: "Cerrar sesión",
  },
  time: {
    now: "Ahora mismo",
    min: "min",
    hour: "h",
    day: "d",
    ago: "atrás",
  },
  common: {
    loading: "Cargando...",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Añadir",
    yes: "Sí",
    no: "No",
  },
};

const zh: Translation = {
  app: {
    name: "BabyCare Daily",
    tagline: "最简单、最智能的婴儿日常跟踪应用",
  },
  nav: {
    home: "首页",
    feeding: "喂食",
    diaper: "尿布",
    sleep: "睡眠",
    health: "健康",
    milestones: "里程碑",
    settings: "设置",
  },
  dashboard: {
    today: "今天",
    last24h: "近24小时",
    todaySummary: "今日总结",
    recentFeedings: "最近喂食",
    recentDiapers: "最近尿布",
    recentSleep: "最近睡眠",
    addNew: "新增",
  },
  feeding: {
    title: "喂食",
    newFeeding: "新增喂食",
    type: "类型",
    breastLeft: "左侧母乳",
    breastRight: "右侧母乳",
    bottle: "奶瓶",
    formula: "配方奶",
    solid: "固体食物",
    startTime: "开始时间",
    endTime: "结束时间",
    duration: "持续时间",
    amount: "数量",
    unit: "毫升/盎司",
    note: "备注",
    save: "保存",
    cancel: "取消",
  },
  diaper: {
    title: "尿布",
    newDiaper: "新增尿布",
    type: "类型",
    wet: "尿湿",
    dirty: "便便",
    mixed: "混合",
    time: "时间",
    note: "备注",
    save: "保存",
    cancel: "取消",
  },
  sleep: {
    title: "睡眠",
    newSleep: "新增睡眠",
    type: "类型",
    nap: "小睡",
    night: "夜间",
    startTime: "开始时间",
    endTime: "结束时间",
    duration: "持续时间",
    location: "地点",
    mood: "情绪",
    moods: {
      happy: "开心",
      fussy: "烦躁",
      calm: "平静",
      crying: "哭泣",
    },
    note: "备注",
    save: "保存",
    cancel: "取消",
  },
  health: {
    title: "健康",
    growth: "生长",
    vaccinations: "疫苗",
    records: "健康记录",
    weight: "体重",
    height: "身高",
    headCircumference: "头围",
    addGrowth: "添加生长记录",
    addVaccination: "添加疫苗",
    addRecord: "添加健康记录",
    date: "日期",
    name: "名称",
    nextDueDate: "下次接种日期",
    batchNumber: "批次号",
    type: "类型",
    value: "数值",
    medication: "药物",
    dosage: "剂量",
    note: "备注",
    save: "保存",
    cancel: "取消",
  },
  milestone: {
    title: "里程碑",
    newMilestone: "新的里程碑",
    date: "日期",
    description: "描述",
    category: "类别",
    addPhoto: "添加照片",
    save: "保存",
    cancel: "取消",
  },
  settings: {
    title: "设置",
    language: "语言",
    units: "单位",
    metric: "公制",
    imperial: "英制",
    notifications: "通知",
    theme: "主题",
    light: "浅色",
    dark: "深色",
    system: "系统",
    export: "导出数据",
    about: "关于",
    logout: "退出",
  },
  time: {
    now: "刚刚",
    min: "分钟",
    hour: "小时",
    day: "天",
    ago: "前",
  },
  common: {
    loading: "加载中...",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    add: "添加",
    yes: "是",
    no: "否",
  },
};

export const translations = { en, sw, fr, es, zh };
