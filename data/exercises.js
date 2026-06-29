window.WEIGHT_TIER_OPTIONS = [
  { id: 'light', label: 'Léger' },
  { id: 'medium', label: 'Moyen' },
  { id: 'heavy', label: 'Lourd' }
];

window.WEIGHTED_EQUIPMENT = [
  { id: 'dumbbells', label: 'Haltères' },
  { id: 'kettlebell', label: 'Kettlebell' }
];

window.EXERCISES = [
  { id: 'pushups', nameFr: 'Pompes', muscles: ['chest', 'arms', 'shoulders'], equipment: [], avoidIf: ['wrist', 'shoulder'], priority: 3 },
  { id: 'incline_pushups', nameFr: 'Pompes inclinées', muscles: ['chest', 'arms'], equipment: ['bench'], avoidIf: ['wrist', 'shoulder'], priority: 2 },
  { id: 'dumbbell_press', nameFr: 'Développé haltères', muscles: ['chest', 'arms', 'shoulders'], equipment: ['dumbbells', 'bench'], weightOptions: [{ equipment: 'dumbbells', tier: 'medium' }], avoidIf: ['shoulder'], priority: 3 },
  { id: 'dumbbell_fly', nameFr: 'Écartés haltères', muscles: ['chest'], equipment: ['dumbbells', 'bench'], weightOptions: [{ equipment: 'dumbbells', tier: 'light' }], avoidIf: ['shoulder'], priority: 2 },
  { id: 'pullups', nameFr: 'Tractions', muscles: ['back', 'arms'], equipment: ['pull_up_bar'], avoidIf: ['shoulder', 'wrist'], priority: 3 },
  { id: 'inverted_row', nameFr: 'Rowing inversé', muscles: ['back', 'arms'], equipment: ['pull_up_bar'], avoidIf: ['shoulder'], priority: 2 },
  { id: 'dumbbell_row', nameFr: 'Rowing haltères', muscles: ['back', 'arms'], equipment: ['dumbbells'], weightOptions: [{ equipment: 'dumbbells', tier: 'medium' }], avoidIf: ['lower_back'], priority: 3 },
  { id: 'superman', nameFr: 'Superman', muscles: ['back', 'glutes'], equipment: ['mat'], avoidIf: ['lower_back', 'neck'], priority: 1 },
  { id: 'shoulder_press', nameFr: 'Développé épaules', muscles: ['shoulders', 'arms'], equipment: ['dumbbells'], weightOptions: [{ equipment: 'dumbbells', tier: 'medium' }], avoidIf: ['shoulder', 'neck'], priority: 3 },
  { id: 'lateral_raise', nameFr: 'Élévations latérales', muscles: ['shoulders'], equipment: ['dumbbells'], weightOptions: [{ equipment: 'dumbbells', tier: 'light' }], avoidIf: ['shoulder'], priority: 2 },
  { id: 'pike_pushups', nameFr: 'Pompes pike', muscles: ['shoulders', 'arms'], equipment: ['mat'], avoidIf: ['shoulder', 'wrist', 'neck'], priority: 2 },
  { id: 'bicep_curl', nameFr: 'Curl biceps', muscles: ['arms'], equipment: ['dumbbells'], weightOptions: [{ equipment: 'dumbbells', tier: 'medium' }], avoidIf: ['wrist'], priority: 2 },
  { id: 'tricep_extension', nameFr: 'Extension triceps', muscles: ['arms'], equipment: ['dumbbells'], weightOptions: [{ equipment: 'dumbbells', tier: 'light' }], avoidIf: ['shoulder', 'wrist'], priority: 2 },
  { id: 'dips', nameFr: 'Dips', muscles: ['arms', 'chest', 'shoulders'], equipment: ['bench'], avoidIf: ['shoulder', 'wrist'], priority: 2 },
  { id: 'plank', nameFr: 'Planche', muscles: ['core'], equipment: ['mat'], avoidIf: ['shoulder', 'wrist'], priority: 3 },
  { id: 'crunch', nameFr: 'Crunch', muscles: ['core'], equipment: ['mat'], avoidIf: ['neck', 'lower_back'], priority: 2 },
  { id: 'bicycle_crunch', nameFr: 'Crunch vélo', muscles: ['core'], equipment: ['mat'], avoidIf: ['neck', 'lower_back'], priority: 2 },
  { id: 'dead_bug', nameFr: 'Dead bug', muscles: ['core'], equipment: ['mat'], avoidIf: ['lower_back'], priority: 2 },
  { id: 'russian_twist', nameFr: 'Rotations russes', muscles: ['core'], equipment: ['mat'], avoidIf: ['lower_back', 'neck'], priority: 2 },
  { id: 'leg_raise', nameFr: 'Relevés de jambes', muscles: ['core'], equipment: ['mat'], avoidIf: ['lower_back', 'neck'], priority: 2 },
  { id: 'side_plank', nameFr: 'Planche latérale', muscles: ['core'], equipment: ['mat'], avoidIf: ['shoulder', 'wrist'], priority: 2 },
  { id: 'hollow_hold', nameFr: 'Hollow hold', muscles: ['core'], equipment: ['mat'], avoidIf: ['lower_back', 'neck'], priority: 2 },
  { id: 'heel_touches', nameFr: 'Touchers de talons', muscles: ['core'], equipment: ['mat'], avoidIf: ['neck', 'lower_back'], priority: 2 },
  { id: 'bird_dog', nameFr: 'Bird dog', muscles: ['core', 'back'], equipment: ['mat'], avoidIf: ['lower_back', 'wrist'], priority: 2 },
  { id: 'plank_shoulder_tap', nameFr: 'Planche touchés d\'épaules', muscles: ['core', 'shoulders'], equipment: ['mat'], avoidIf: ['shoulder', 'wrist'], priority: 2 },
  { id: 'flutter_kicks', nameFr: 'Battements de jambes', muscles: ['core'], equipment: ['mat'], avoidIf: ['lower_back', 'neck'], priority: 2 },
  { id: 'reverse_crunch', nameFr: 'Crunch inversé', muscles: ['core'], equipment: ['mat'], avoidIf: ['neck', 'lower_back'], priority: 2 },
  { id: 'toe_touches', nameFr: 'Touchers de pieds', muscles: ['core'], equipment: ['mat'], avoidIf: ['lower_back', 'neck'], priority: 2 },
  { id: 'squat', nameFr: 'Squats', muscles: ['legs', 'glutes'], equipment: [], avoidIf: ['knee', 'lower_back'], priority: 3 },
  { id: 'goblet_squat', nameFr: 'Goblet squat', muscles: ['legs', 'glutes'], equipment: ['dumbbells', 'kettlebell'], weightOptions: [{ equipment: 'dumbbells', tier: 'medium' }, { equipment: 'kettlebell', tier: 'heavy' }], avoidIf: ['knee', 'lower_back'], priority: 3 },
  { id: 'lunge', nameFr: 'Fentes', muscles: ['legs', 'glutes'], equipment: [], avoidIf: ['knee'], priority: 3 },
  { id: 'glute_bridge', nameFr: 'Pont fessier', muscles: ['glutes', 'legs'], equipment: ['mat'], avoidIf: ['lower_back'], priority: 2 },
  { id: 'calf_raise', nameFr: 'Mollets debout', muscles: ['legs'], equipment: [], avoidIf: ['knee'], priority: 1 },
  { id: 'band_pull_apart', nameFr: 'Tirage élastique', muscles: ['back', 'shoulders'], equipment: ['resistance_bands'], avoidIf: ['shoulder'], priority: 2 },
  { id: 'band_squat', nameFr: 'Squat élastique', muscles: ['legs', 'glutes'], equipment: ['resistance_bands'], avoidIf: ['knee'], priority: 2 },
  { id: 'kettlebell_swing', nameFr: 'Kettlebell swing', muscles: ['legs', 'glutes', 'back'], equipment: ['kettlebell'], weightOptions: [{ equipment: 'kettlebell', tier: 'medium' }], avoidIf: ['lower_back', 'shoulder'], priority: 3 },
  { id: 'kettlebell_goblet_squat', nameFr: 'Goblet squat kettlebell', muscles: ['legs', 'glutes'], equipment: ['kettlebell'], weightOptions: [{ equipment: 'kettlebell', tier: 'heavy' }], avoidIf: ['knee', 'lower_back'], priority: 3 },
  { id: 'kettlebell_deadlift', nameFr: 'Soulevé de terre kettlebell', muscles: ['legs', 'glutes', 'back'], equipment: ['kettlebell'], weightOptions: [{ equipment: 'kettlebell', tier: 'heavy' }], avoidIf: ['lower_back'], priority: 3 },
  { id: 'kettlebell_row', nameFr: 'Rowing kettlebell', muscles: ['back', 'arms'], equipment: ['kettlebell'], weightOptions: [{ equipment: 'kettlebell', tier: 'medium' }], avoidIf: ['lower_back'], priority: 3 },
  { id: 'kettlebell_press', nameFr: 'Développé kettlebell', muscles: ['shoulders', 'arms'], equipment: ['kettlebell'], weightOptions: [{ equipment: 'kettlebell', tier: 'medium' }], avoidIf: ['shoulder', 'neck'], priority: 3 },
  { id: 'kettlebell_halo', nameFr: 'Halo kettlebell', muscles: ['shoulders', 'core'], equipment: ['kettlebell'], weightOptions: [{ equipment: 'kettlebell', tier: 'light' }], avoidIf: ['shoulder', 'neck'], priority: 2 },
  { id: 'kettlebell_rdl', nameFr: 'Soulevé roumain kettlebell', muscles: ['legs', 'glutes', 'back'], equipment: ['kettlebell'], weightOptions: [{ equipment: 'kettlebell', tier: 'medium' }], avoidIf: ['lower_back'], priority: 2 },
  { id: 'kettlebell_windmill', nameFr: 'Moulin kettlebell', muscles: ['core', 'shoulders'], equipment: ['kettlebell'], weightOptions: [{ equipment: 'kettlebell', tier: 'light' }], avoidIf: ['lower_back', 'shoulder'], priority: 2 },
  { id: 'kettlebell_thruster', nameFr: 'Thruster kettlebell', muscles: ['legs', 'shoulders', 'arms'], equipment: ['kettlebell'], weightOptions: [{ equipment: 'kettlebell', tier: 'medium' }], avoidIf: ['knee', 'shoulder'], priority: 2 },
  { id: 'kettlebell_clean', nameFr: 'Clean kettlebell', muscles: ['legs', 'back', 'shoulders'], equipment: ['kettlebell'], weightOptions: [{ equipment: 'kettlebell', tier: 'medium' }], avoidIf: ['lower_back', 'shoulder', 'wrist'], highImpact: true, priority: 2 },
  { id: 'kettlebell_turkish_getup', nameFr: 'Turkish get-up', muscles: ['core', 'shoulders', 'legs'], equipment: ['kettlebell'], weightOptions: [{ equipment: 'kettlebell', tier: 'medium' }], avoidIf: ['shoulder', 'wrist', 'lower_back'], priority: 2 },
  { id: 'mountain_climber', nameFr: 'Mountain climbers', muscles: ['core', 'legs'], equipment: ['mat'], avoidIf: ['knee', 'wrist'], priority: 2 },
  { id: 'burpee', nameFr: 'Burpees', muscles: ['legs', 'chest', 'core'], equipment: ['mat'], avoidIf: ['knee', 'shoulder', 'wrist'], highImpact: true, priority: 1 },
  { id: 'high_plank', nameFr: 'Planche haute', muscles: ['core', 'shoulders'], equipment: ['mat'], avoidIf: ['shoulder', 'wrist'], priority: 3 },
  { id: 'jump_squat', nameFr: 'Squat sauté', muscles: ['legs', 'glutes'], equipment: [], avoidIf: ['knee', 'lower_back'], highImpact: true, priority: 2 },
  { id: 'wall_sit', nameFr: 'Chaise murale', muscles: ['legs'], equipment: [], avoidIf: ['knee'], priority: 2 },
  { id: 'step_up', nameFr: 'Montées sur banc', muscles: ['legs', 'glutes'], equipment: ['bench'], avoidIf: ['knee'], priority: 2 },
  { id: 'dumbbell_lunge', nameFr: 'Fentes haltères', muscles: ['legs', 'glutes'], equipment: ['dumbbells'], weightOptions: [{ equipment: 'dumbbells', tier: 'medium' }], avoidIf: ['knee', 'lower_back'], priority: 2 },
  { id: 'dumbbell_squat', nameFr: 'Squat haltères', muscles: ['legs', 'glutes'], equipment: ['dumbbells'], weightOptions: [{ equipment: 'dumbbells', tier: 'medium' }], avoidIf: ['knee', 'lower_back'], priority: 2 },
  { id: 'hammer_curl', nameFr: 'Curl marteau', muscles: ['arms'], equipment: ['dumbbells'], weightOptions: [{ equipment: 'dumbbells', tier: 'medium' }], avoidIf: ['wrist'], priority: 2 },
  { id: 'front_raise', nameFr: 'Élévations frontales', muscles: ['shoulders'], equipment: ['dumbbells'], weightOptions: [{ equipment: 'dumbbells', tier: 'light' }], avoidIf: ['shoulder'], priority: 2 },
  { id: 'bear_crawl', nameFr: 'Bear crawl', muscles: ['core', 'shoulders', 'legs'], equipment: ['mat'], avoidIf: ['wrist', 'shoulder'], priority: 2 },
  { id: 'squat_pulse', nameFr: 'Squats pulsés', muscles: ['legs', 'glutes'], equipment: [], avoidIf: ['knee'], priority: 2 },
  { id: 'v_up', nameFr: 'V-ups', muscles: ['core'], equipment: ['mat'], avoidIf: ['lower_back', 'neck'], priority: 2 },
  { id: 'skater_hops', nameFr: 'Sauts latéraux', muscles: ['legs', 'glutes'], equipment: [], avoidIf: ['knee'], highImpact: true, priority: 2 },
  { id: 'inchworm', nameFr: 'Inchworm', muscles: ['core', 'shoulders', 'legs'], equipment: ['mat'], avoidIf: ['wrist', 'lower_back'], priority: 1 },
  { id: 'kettlebell_farmer_carry', nameFr: 'Farmer walk', muscles: ['back', 'core', 'legs'], equipment: ['kettlebell'], weightOptions: [{ equipment: 'kettlebell', tier: 'heavy' }], avoidIf: ['lower_back', 'wrist'], priority: 2 },
  { id: 'band_chest_press', nameFr: 'Presse poitrine élastique', muscles: ['chest', 'arms'], equipment: ['resistance_bands'], avoidIf: ['shoulder'], priority: 2 },
  { id: 'single_leg_glute_bridge', nameFr: 'Pont fessier unijambiste', muscles: ['glutes', 'legs'], equipment: ['mat'], avoidIf: ['lower_back', 'knee'], priority: 2 },
  { id: 'plank_up_down', nameFr: 'Planche haut/bas', muscles: ['core', 'arms'], equipment: ['mat'], avoidIf: ['wrist', 'shoulder'], priority: 2 }
];

window.WARMUP_BLOCKS = [
  { id: 'jumping_jacks', nameFr: 'Jumping jacks', seconds: 30, highImpact: true },
  { id: 'high_knees', nameFr: 'Montées de genoux', seconds: 30, highImpact: true },
  { id: 'arm_circles', nameFr: 'Cercles de bras', seconds: 30, highImpact: false },
  { id: 'jogging', nameFr: 'Course sur place', seconds: 30, highImpact: true },
  { id: 'torso_twist', nameFr: 'Rotations du buste', seconds: 30, highImpact: false },
  { id: 'marching', nameFr: 'Marche sur place', seconds: 30, highImpact: false },
  { id: 'walking_high_knees', nameFr: 'Montées de genoux marchées', seconds: 30, highImpact: false },
  { id: 'hip_circles', nameFr: 'Cercles de hanches', seconds: 30, highImpact: false }
];

window.WARMUP_DURATION_SECONDS = 120;
window.PREP_SECONDS = 3;

window.EQUIPMENT_OPTIONS = [
  { id: 'bodyweight', label: 'Poids du corps' },
  { id: 'mat', label: 'Tapis' },
  { id: 'dumbbells', label: 'Haltères' },
  { id: 'pull_up_bar', label: 'Barre de traction' },
  { id: 'bench', label: 'Banc' },
  { id: 'resistance_bands', label: 'Élastiques' },
  { id: 'kettlebell', label: 'Kettlebell' }
];

window.MUSCLE_OPTIONS = [
  { id: 'chest', label: 'Poitrine' },
  { id: 'back', label: 'Dos' },
  { id: 'shoulders', label: 'Épaules' },
  { id: 'arms', label: 'Bras' },
  { id: 'core', label: 'Abdos' },
  { id: 'legs', label: 'Jambes' },
  { id: 'glutes', label: 'Fessiers' }
];

window.INJURY_OPTIONS = [
  { id: 'knee', label: 'Genou' },
  { id: 'shoulder', label: 'Épaule' },
  { id: 'lower_back', label: 'Bas du dos' },
  { id: 'wrist', label: 'Poignet' },
  { id: 'neck', label: 'Cou' }
];
