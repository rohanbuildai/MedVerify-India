const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const { v4: uuidv4 } = require('uuid');

// Common Indian pharmaceutical companies
const companies = [
  'Cipla Ltd', 'Sun Pharmaceutical Industries Ltd', 'Dr. Reddy\'s Laboratories Ltd',
  'Mankind Pharma Ltd', 'Alkem Laboratories Ltd', 'Lupin Ltd', 'Aurobindo Pharma Ltd',
  'Zydus Lifesciences Ltd', 'Glenmark Pharmaceuticals Ltd', 'Macleods Pharmaceuticals Ltd',
  'Abbott Healthcare Pvt Ltd', 'Sanofi India Ltd', 'GlaxoSmithKline Pharmaceuticals Ltd',
  'Pfizer Ltd', 'Novartis India Ltd', 'Bayer Pharmaceuticals Pvt Ltd', 'Bristol-Myers Squibb India',
  'Merck Ltd', 'GSK', 'USV Pvt Ltd', 'Panacea Biotech', 'Himalaya Drug Company',
  'Intas Pharmaceuticals Ltd', 'Cadila Healthcare Ltd', 'Wockhardt Ltd', 'Ajanta Pharma Ltd',
  'Torrent Pharmaceuticals Ltd', 'Jubilant Pharmova Ltd', 'Gujarat Terce Laboratories',
  'Mohan Meakin Ltd', 'Kopran Ltd', 'Indoco Remedies Ltd', 'Granules India Ltd',
  'Alembic Pharmaceuticals Ltd', 'Triveni Interchem Pvt Ltd', 'Orchid Pharma Ltd',
  'Unichem Laboratories Ltd', 'FDC Ltd', 'Blue Cross Laboratories Ltd',
  'Morepen Laboratories Ltd', 'Wyndham Laboratories Ltd', 'Troikaa Pharmaceuticals Ltd',
  'Sagun Transformation Pvt Ltd', 'Pharmasutical Ltd', 'Medley Pharmaceuticals Ltd',
  'Bal Pharma Ltd', 'Galpha Laboratories Ltd', 'Srish Pharmaceuticals Ltd',
  'Organic Labs Pvt Ltd', 'Biochem Pharmaceutical Industries'
];

const categories = [
  'Antibiotic', 'Antifungal', 'Antiviral', 'Analgesic', 'Antipyretic',
  'Antihypertensive', 'Antidiabetic', 'Antihistamine', 'Antacid',
  'Cardiovascular', 'Respiratory', 'Neurological', 'Oncology',
  'Vitamin/Supplement', 'Vaccine', 'Contraceptive', 'Other'
];

const dosageForms = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch', 'Suppository', 'Other'];

const compositions = {
  'Antibiotic': ['Amoxicillin', 'Azithromycin', 'Ciprofloxacin', 'Cefixime', 'Levofloxacin', 'Amoxicillin + Clavulanate', 'Doxycycline', 'Metronidazole', 'Ceftriaxone', 'Cloxacillin', 'Gentamicin', 'Amikacin', 'Cefotaxime', 'Aztreonam', 'Piperacillin + Tazobactam', 'Meropenem', 'Imipenem', 'Vancomycin', 'Teicoplanin', 'Linezolid', 'Clindamycin', 'Cotrimoxazole', 'Norfloxacin', 'Ofloxacin', 'Rifampicin', 'Isoniazid', 'Pyrazinamide', 'Ethambutol', 'Streptomycin'],
  'Antiviral': ['Acyclovir', 'Valacyclovir', 'Famciclovir', 'Oseltamivir', 'Ribavirin', 'Remdesivir', 'Favipiravir', 'Sofosbuvir', 'Daclatasvir', 'Velpatasvir', 'Tenofovir', 'Emtricitabine', 'Lamivudine', 'Zidovudine', 'Abacavir'],
  'Analgesic': ['Paracetamol', 'Ibuprofen', 'Aspirin', 'Naproxen', 'Diclofenac', 'Tramadol', 'Hydrocodone', 'Codeine', 'Morphine', 'Pethidine', 'Ketorolac', 'Mefenamic Acid', 'Acetaminophen', 'Nimesulide'],
  'Antipyretic': ['Paracetamol', 'Aspirin', 'Ibuprofen', 'Nimesulide', 'Mefenamic Acid'],
  'Antihypertensive': ['Amlodipine', 'Telmisartan', 'Losartan', 'Ramipril', 'Enalapril', 'Metoprolol', 'Atenolol', 'Bisoprolol', 'Carvedilol', 'Nebivolol', 'Olmesartan', 'Valsartan', 'Irbesartan', 'Perindopril', 'Lisinopril', 'Hydrochlorothiazide', 'Spironolactone', 'Furosemide', 'Mannitol'],
  'Antidiabetic': ['Metformin', 'Glipizide', 'Glimepiride', 'Gliclazide', 'Pioglitazone', 'Sitagliptin', 'Vildagliptin', 'Linagliptin', 'Teneligliptin', 'Repaglinide', 'Nateglinide', 'Acarbose', 'Miglitol', 'Voglibose', 'Canagliflozin', 'Dapagliflozin', 'Empagliflozin', 'Ertugliflozin', 'Dulaglutide', 'Liraglutide'],
  'Antihistamine': ['Cetirizine', 'Loratadine', 'Fexofenadine', 'Diphenhydramine', 'Chlorpheniramine', 'Hydroxyzine', 'Promethazine', 'Desloratadine', 'Levocetirizine', 'Ebastine'],
  'Antacid': ['Omeprazole', 'Pantoprazole', 'Rabeprazole', 'Esomeprazole', 'Lansoprazole', 'Ranitidine', 'Famotidine', 'Cimetidine', 'Magaldrate + Simethicone', 'Domperidone', 'Metoclopramide', 'Ondansetron', 'Granisetron', 'Pantaprazole'],
  'Cardiovascular': ['Atorvastatin', 'Rosuvastatin', 'Simvastatin', 'Pitavastatin', 'Ezetimibe', 'Clopidogrel', 'Aspirin', 'Warfarin', 'Rivaroxaban', 'Apixaban', 'Dabigatran', 'Heparin', 'Enoxaparin', 'Trimetazidine', 'Ivabradine', 'Ranolazine', 'Isosorbide Dinitrate', 'Isosorbide Mononitrate', 'Nitroglycerin'],
  'Respiratory': ['Salbutamol', 'Levosalbutamol', 'Theophylline', 'Budesonide', 'Fluticasone', 'Montelukast', 'Acetylcysteine', 'Ambroxol', 'Guaifenesin', 'Codeine Phosphate', 'Chlorpheniramine + Phenylephrine', 'Promethazine', 'Beclomethasone', 'Salmeterol', 'Formoterol', 'Indacaterol', 'Tiotropium', 'Ipratropium'],
  'Neurological': ['Carbamazepine', 'Phenytoin', 'Valproic Acid', 'Levetiracetam', 'Clonazepam', 'Diazepam', 'Alprazolam', 'Lorazepam', 'Phenobarbital', 'Gabapentin', 'Pregabalin', 'Duloxetine', 'Venlafaxine', 'Escitalopram', 'Sertraline', 'Fluoxetine', 'Paroxetine', 'Citalopram', 'Amitriptyline', 'Imipramine', 'Haloperidol', 'Risperidone', 'Olanzapine', 'Quetiapine', 'Levodopa', 'Pramipexole', 'Ropinirole', 'Trihexyphenidyl', 'Propranolol', 'Procyclidine'],
  'Oncology': ['Cyclophosphamide', 'Doxorubicin', 'Paclitaxel', 'Carboplatin', 'Cisplatin', '5-Fluorouracil', 'Methotrexate', 'Vincristine', 'Vinblastine', 'Bleomycin', 'Etoposide', 'Irinotecan', 'Oxaliplatin', 'Gemcitabine', 'Docetaxel', 'Imatinib', 'Erlotinib', 'Gefitinib', 'Sorafenib', 'Sunitinib', 'Rituximab', 'Trastuzumab', 'Bevacizumab', 'Pembrolizumab', 'Nivolumab'],
  'Vitamin/Supplement': ['Vitamin A', 'Vitamin B Complex', 'Vitamin B1', 'Vitamin B2', 'Vitamin B6', 'Vitamin B12', 'Vitamin C', 'Vitamin D3', 'Vitamin E', 'Vitamin K', 'Calcium Carbonate', 'Calcium Gluconate', 'Iron', 'Ferrous Sulfate', 'Folic Acid', 'Zinc', 'Magnesium', 'Potassium Chloride', 'Multivitamins', 'Omega-3 Fatty Acids', 'Coenzyme Q10', 'Biotin', 'Ascorbic Acid', 'Cholecalciferol'],
  'Antifungal': ['Clotrimazole', 'Terbinafine', 'Ketoconazole', 'Itraconazole', 'Fluconazole', 'Miconazole', 'Griseofulvin', 'Nystatin', 'Amphotericin B', 'Voriconazole'],
  'Contraceptive': ['Levonorgestrel', 'Ethinyl Estradiol', 'Norethisterone', 'Desogestrel', 'Drospirenone', 'Yasmin', 'Mala-D', 'Mala-N', 'Condoms', 'Copper-T'],
  'Vaccine': ['Covishield', 'Covaxin', 'Influenza Vaccine', 'Hepatitis A Vaccine', 'Hepatitis B Vaccine', 'Measles Vaccine', 'Rubella Vaccine', 'Polio Vaccine', 'DPT Vaccine', 'BCG Vaccine', 'Typhoid Vaccine', 'Yellow Fever Vaccine', 'Rabies Vaccine', 'Chickenpox Vaccine', 'Pneumococcal Vaccine'],
  'Other': ['ORS', 'ORS + Zinc', 'Povidone Iodine', 'Chlorhexidine', 'Hydrogen Peroxide', 'Benzyl Benzoate', 'Permethrin', 'Ivermectin', 'Albendazole', 'Mebendazole', 'Levocarnitine', 'Silymarin', 'Ursodeoxycholic Acid', 'Probiotics', 'L-Glutamine']
};

const additionalBrands = {
  'Metformin': ['Glycomet', 'Metformin', 'Gluconorm', 'Bigmet', 'Obimet', 'Dianet', 'Metformin-S', 'Etform'],
  'Amlodipine': ['Amlovas', 'Amlodipine', 'Amlip', 'Amlocard', 'Amlosafe', 'Amlodep'],
  'Omeprazole': ['Omez', 'Omeprazole', 'Ocid', 'Ulcepan', 'Peg', 'Omax'],
  'Cetirizine': ['Cetrizine', 'Cetirizine', 'Alerid', 'Cetzine', 'Allercet', 'Zyrtec'],
  'Azithromycin': ['Azithral', 'Azithromycin', 'Zithromax', 'Azee', 'Zah', 'Azifast'],
  'Paracetamol': ['Crocin', 'Dolo', 'Calpol', 'Penta', 'FeverN', 'Lekadol', 'Pyrelief'],
  'Ibuprofen': ['Ibugesic', 'Ibuprofen', 'Brufen', 'Iburac', 'Proflex', 'Nurofen'],
  'Atorvastatin': ['Atorva', 'Atorvastatin', 'Azor', 'Lipitor', 'Ator', 'Tonact'],
  'Montelukast': ['Montair', 'Montelukast', 'Singulair', 'Monteluk', 'Romilast', 'Airbye'],
  'Levofloxacin': ['Levolet', 'Levofloxacin', 'Levaquin', 'Leflox', 'Levoc', 'Flox'],
  'Amlodipine + Telmisartan': ['Telmikind-AM', 'Win BP', 'Sitelm-A', 'Triasence', 'Amlokind-T'],
  'Metformin + Glimepiride': ['Glycomet-GP', 'Metglibo', 'Gluformin-P', 'Amaryl-M', 'Glimy-M'],
  'Amlodipine + Metoprolol': ['Amlopin-M', 'Cortal-AM', 'BPCO', 'Amlogard-M'],
  'Paracetamol + Ibuprofen': ['Combiflam', 'Ibugesic Plus', 'Dolokind-P', 'Duocot'],
  'Cetirizine + Pseudoephedrine': ['Cetrizine-D', 'Alerid-D', 'Rehintin-P', 'Nepocet']
};

function generateStrength(composition, category) {
  const strengths = {
    default: ['5', '10', '20', '25', '50', '100', '200', '250', '500', '650', '1000'],
    'Vitamin/Supplement': ['100', '200', '500', '1000', '1000IU', '5000IU'],
    'Eye Drops': ['0.25%', '0.3%', '0.5%', '1%'],
    'Cream': ['0.5%', '1%', '2%', '5%'],
    'Inhaler': ['50mcg', '100mcg', '200mcg', '250mcg']
  };
  
  const categoryKey = Object.keys(strengths).find(k => category.includes(k) || k === 'default');
  const list = strengths[categoryKey] || strengths.default;
  let unit = 'mg';
  if (category.includes('Vitamin') && !list.includes('mg')) unit = 'IU';
  else if (category === 'Vaccine') unit = 'dose';
  else if (category === 'Cream' || category === 'Ointment') unit = '%';
  return list[Math.floor(Math.random() * list.length)] + unit;
}

function generateBrandName(composition) {
  const prefixes = ['Al', 'Ar', 'Bi', 'Ci', 'Co', 'De', 'Di', 'El', 'Em', 'Ex', 'Fa', 'Gl', 'He', 'In', 'La', 'Le', 'Li', 'Lu', 'Ma', 'Me', 'Mo', 'Ne', 'Nu', 'Pa', 'Ph', 'Po', 'Pr', 'Ra', 'Re', 'Ri', 'Ro', 'Ru', 'Se', 'Si', 'So', 'Sp', 'Su', 'Ta', 'Te', 'Ti', 'Tr', 'Va', 'Vi', 'Vo', 'Ze', 'Zy'];
  const suffixes = ['a', 'o', 'ex', 'in', 'ol', 'al', 'il', 'ide', 'ate', 'x', 'zin', 'p', 'm', 'n', 'v', 'B', 'C', 'D', 'F', 'G', 'L', 'M', 'P', 'R', 'S', 'T', 'V', 'X', 'Z'];
  
  if (additionalBrands[composition]) {
    return additionalBrands[composition][Math.floor(Math.random() * additionalBrands[composition].length)];
  }
  return prefixes[Math.floor(Math.random() * prefixes.length)] + suffixes[Math.floor(Math.random() * suffixes.length)];
}

function generatePackageSize(dosage) {
  switch(dosage) {
    case 'Tablet':
    case 'Capsule':
      const counts = [3, 5, 6, 7, 10, 14, 15, 20, 21, 28, 30, 50, 60, 100];
      return `${counts[Math.floor(Math.random() * counts.length)]} tablets/strip`;
    case 'Syrup':
    case 'Other':
      const ml = [30, 60, 100, 120, 150, 200, 250];
      return `${ml[Math.floor(Math.random() * ml.length)]}ml`;
    case 'Injection':
      return `${[1, 2, 5, 10][Math.floor(Math.random() * 4)]}ml vial`;
    case 'Cream':
    case 'Ointment':
      const g = [5, 10, 15, 20, 30, 50][Math.floor(Math.random() * 6)];
      return `${g}g tube`;
    case 'Drops':
      return `${[5, 10, 15][Math.floor(Math.random() * 3)]}ml`;
    case 'Inhaler':
      return `${[100, 200, 250][Math.floor(Math.random() * 3)]} doses`;
    default:
      return '1 unit';
  }
}

function generateScheduleType(category) {
  const scheduleH = ['Antibiotic', 'Antiviral', 'Oncology', 'Neurological', 'Contraceptive'];
  const scheduleH1 = ['Antihypertensive', 'Antidiabetic', 'Respiratory', 'Antifungal'];
  
  if (scheduleH.includes(category)) return 'H';
  if (scheduleH1.includes(category)) return 'H1';
  if (category === 'Vaccine') return 'X';
  if (category === 'Vitamin/Supplement' || category === 'Antacid' || category === 'Analgesic' || category === 'Other') return 'OTC';
  return 'Unknown';
}

function generatePhysicalFeatures(dosage) {
  const colors = ['White', 'Light Yellow', 'Light Pink', 'Light Blue', 'Light Green', 'Beige', 'Brown', 'Red', 'Orange', 'Yellow', 'Cream'];
  const shapes = ['Round', 'Oval', 'Capsule-shaped', 'Rectangular', 'Diamond', 'Square'];
  
  if (['Tablet', 'Capsule'].includes(dosage)) {
    return {
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      imprint: Math.random() > 0.3 ? `${['A', 'B', 'C', 'M', 'T', 'X', 'Z'][Math.floor(Math.random() * 7)]}${Math.floor(Math.random() * 999)}` : '',
      coating: ['Film coated', 'Sugar coated', 'Enteric coated', 'Uncoated'][Math.floor(Math.random() * 4)]
    };
  }
  if (['Cream', 'Ointment'].includes(dosage)) {
    return { color: colors.slice(0, 6).join(', '), specialMarking: 'Tube' };
  }
  if (['Syrup', 'Drops', 'Other'].includes(dosage)) {
    return { color: colors[Math.floor(Math.random() * colors.length)], specialMarking: 'Bottle' };
  }
  if (dosage === 'Injection') {
    return { color: 'White powder/Liquid', specialMarking: 'Vial/Ampoule' };
  }
  return {};
}

function generateMedicines(count, startId) {
  const medicines = [];
  let id = startId;

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const compList = compositions[category] || compositions['Other'];
    const composition = compList[Math.floor(Math.random() * compList.length)];
    const dosage = dosageForms[Math.floor(Math.random() * dosageForms.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    
    const strength = generateStrength(composition, category);
    const brandName = generateBrandName(composition);
    const medicineName = `${brandName} ${strength}`;

    medicines.push({
      name: medicineName,
      genericName: composition,
      brand: brandName,
      manufacturer: company,
      category: category,
      composition: `${composition} ${strength}`,
      dosageForm: dosage,
      strength: strength,
      packageSize: generatePackageSize(dosage),
      licenseNumber: `LIC/${id}/${new Date().getFullYear()}/${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
      scheduleType: generateScheduleType(category),
      physicalFeatures: generatePhysicalFeatures(dosage),
      packagingFeatures: { 
        hologramPresent: Math.random() > 0.6, 
        barcodePresent: Math.random() > 0.1,
        securitySealPresent: Math.random() > 0.7,
        colorDescription: 'Standard pharmaceutical packaging'
      },
      isVerified: true,
      riskLevel: ['Antibiotic', 'Antiviral', 'Oncology', 'Cardiovascular'].includes(category) ? 
                  ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] : 
                  ['low', 'medium'][Math.floor(Math.random() * 2)],
      verificationCount: Math.floor(Math.random() * 500),
      reportCount: Math.floor(Math.random() * 20)
    });
    id++;
  }

  return medicines;
}

// @desc    Seed additional medicines
// @route   POST /api/admin/seed-medicines
// @access  Private (Admin only)
router.post('/seed-medicines', require('../middleware/auth').protect, require('../middleware/auth').authorize('admin'), async (req, res, next) => {
  try {
    const count = req.body.count || 1000;
    const maxCount = 5000;
    
    if (count > maxCount) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${maxCount} medicines can be seeded at once`
      });
    }

    const existingCount = await Medicine.countDocuments({});
    const startId = existingCount + 1;
    
    const medicines = generateMedicines(count, startId);
    const inserted = await Medicine.insertMany(medicines);
    
    const newTotal = await Medicine.countDocuments({});
    
    res.status(201).json({
      success: true,
      message: `Successfully seeded ${inserted.length} medicines`,
      data: {
        previousCount: existingCount,
        added: inserted.length,
        total: newTotal
      }
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get seed status
// @route   GET /api/admin/seed-status
// @access  Public
router.get('/seed-status', async (req, res, next) => {
  try {
    const total = await Medicine.countDocuments({});
    const categoryStats = await Medicine.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalMedicines: total,
        categories: categoryStats
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;