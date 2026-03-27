// Seeding script to add 1000 medicines to the database
// Run this with: node backend/utils/seed1000Medicines.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Medicine = require('../models/Medicine');
const User = require('../models/User');
const connectDB = require('../config/db');

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

// Categories
const categories = [
  'Antibiotic', 'Antifungal', 'Antiviral', 'Analgesic', 'Antipyretic',
  'Antihypertensive', 'Antidiabetic', 'Antihistamine', 'Antacid',
  'Cardiovascular', 'Respiratory', 'Neurological', 'Oncology',
  'Vitamin/Supplement', 'Vaccine', 'Contraceptive', 'Gastrointestinal',
  'Musculoskeletal', 'Dermatological', 'Ophthalmic', 'ENT',
  'Hematological', 'Immunosuppressant', 'Hormonal', 'Other'
];

// Dosage forms
const dosageForms = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch', 'Suppository', 'Suspension', 'Gel', 'Solution'];

// Common medicine compositions
const compositions = {
  'Antibiotic': [
    'Amoxicillin', 'Azithromycin', 'Ciprofloxacin', 'Cefixime', 'Levofloxacin',
    'Amoxicillin + Clavulanate', 'Doxycycline', 'Metronidazole', 'Ceftriaxone',
    'Cloxacillin', 'Gentamicin', 'Amikacin', 'Cefotaxime', 'Aztreonam',
    'Piperacillin + Tazobactam', 'Meropenem', 'Imipenem', 'Vancomycin', 'Teicoplanin',
    'Linezolid', 'Clindamycin', 'Cotrimoxazole', 'Norfloxacin', 'Ofloxacin',
    'Rifampicin', 'Isoniazid', 'Pyrazinamide', 'Ethambutol', 'Streptomycin'
  ],
  'Antiviral': [
    'Acyclovir', 'Valacyclovir', 'Famciclovir', 'Oseltamivir', 'Ribavirin',
    'Remdesivir', 'Favipiravir', 'Sofosbuvir', 'Daclatasvir', 'Velpatasvir',
    'Tenofovir', 'Emtricitabine', 'Lamivudine', 'Zidovudine', 'Abacavir'
  ],
  'Analgesic': [
    'Paracetamol', 'Ibuprofen', 'Aspirin', 'Naproxen', 'Diclofenac',
    'Tramadol', 'Hydrocodone', 'Codeine', 'Morphine', 'Pethidine',
    'Ketorolac', 'Mefenamic Acid', 'Acetaminophen', 'Nimesulide'
  ],
  'Antihypertensive': [
    'Amlodipine', 'Telmisartan', 'Losartan', 'Ramipril', 'Enalapril',
    'Metoprolol', 'Atenolol', 'Bisoprolol', 'Carvedilol', 'Nebivolol',
    'Olmesartan', 'Valsartan', 'Irbesartan', 'Perindopril', 'Lisinopril',
    'Hydrochlorothiazide', 'Spironolactone', 'Furosemide', 'Mannitol'
  ],
  'Antidiabetic': [
    'Metformin', 'Glipizide', 'Glimepiride', 'Gliclazide', 'Pioglitazone',
    'Sitagliptin', 'Vildagliptin', 'Linagliptin', 'Teneligliptin', 'Repaglinide',
    'Nateglinide', 'Acarbose', 'Miglitol', 'Voglibose', 'Canagliflozin',
    'Dapagliflozin', 'Empagliflozin', 'Ertugliflozin', 'Dulaglutide', 'Liraglutide'
  ],
  'Antihistamine': [
    'Cetirizine', 'Loratadine', 'Fexofenadine', 'Diphenhydramine', 'Chlorpheniramine',
    'Hydroxyzine', 'Promethazine', 'Desloratadine', 'Levocetirizine', 'Ebastine'
  ],
  'Antacid': [
    'Omeprazole', 'Pantoprazole', 'Rabeprazole', 'Esomeprazole', 'Lansoprazole',
    'Ranitidine', 'Famotidine', 'Cimetidine', 'Magaldrate + Simethicone', 'Domperidone',
    'Metoclopramide', 'Ondansetron', 'Granisetron', 'Pantaprazole'
  ],
  'Cardiovascular': [
    'Atorvastatin', 'Rosuvastatin', 'Simvastatin', 'Pitavastatin', 'Ezetimibe',
    'Clopidogrel', 'Aspirin', 'Warfarin', 'Rivaroxaban', 'Apixaban',
    'Dabigatran', 'Heparin', 'Enoxaparin', 'Trimetazidine', 'Ivabradine',
    'Ranolazine', 'Isosorbide Dinitrate', 'Isosorbide Mononitrate', 'Nitroglycerin'
  ],
  'Respiratory': [
    'Salbutamol', 'Levosalbutamol', 'Theophylline', 'Budesonide', 'Fluticasone',
    'Montelukast', 'Acetylcysteine', 'Ambroxol', 'Guaifenesin', 'Codeine Phosphate',
    'Chlorpheniramine + Phenylephrine', 'Promethazine', 'Beclomethasone', 'Salmeterol',
    'Formoterol', 'Indacaterol', 'Tiotropium', 'Ipratropium'
  ],
  'Neurological': [
    'Carbamazepine', 'Phenytoin', 'Valproic Acid', 'Levetiracetam', 'Clonazepam',
    'Diazepam', 'Alprazolam', 'Lorazepam', 'Phenobarbital', 'Gabapentin',
    'Pregabalin', 'Duloxetine', 'Venlafaxine', 'Escitalopram', 'Sertraline',
    'Fluoxetine', 'Paroxetine', 'Citalopram', 'Amitriptyline', 'Imipramine',
    'Haloperidol', 'Risperidone', 'Olanzapine', 'Quetiapine', 'Levodopa',
    'Pramipexole', 'Ropinirole', 'Trihexyphenidyl', 'Propranolol', 'Procyclidine'
  ],
  'Oncology': [
    'Cyclophosphamide', 'Doxorubicin', 'Paclitaxel', 'Carboplatin', 'Cisplatin',
    '5-Fluorouracil', 'Methotrexate', 'Vincristine', 'Vinblastine', 'Bleomycin',
    'Etoposide', 'Irinotecan', 'Oxaliplatin', 'Gemcitabine', 'Docetaxel',
    'Imatinib', 'Erlotinib', ' Gefitinib', 'Sorafenib', 'Sunitinib',
    'Rituximab', 'Trastuzumab', 'Bevacizumab', 'Pembrolizumab', 'Nivolumab'
  ],
  'Vitamin/Supplement': [
    'Vitamin A', 'Vitamin B Complex', 'Vitamin B1', 'Vitamin B2', 'Vitamin B6',
    'Vitamin B12', 'Vitamin C', 'Vitamin D3', 'Vitamin E', 'Vitamin K',
    'Calcium Carbonate', 'Calcium Gluconate', 'Iron', 'Ferrous Sulfate',
    'Folic Acid', 'Zinc', 'Magnesium', 'Potassium Chloride', 'Multivitamins',
    'Omega-3 Fatty Acids', 'Coenzyme Q10', 'Biotin', 'Ascorbic Acid', 'Cholecalciferol'
  ],
  'Psychiatric': [
    'Sertraline', 'Fluoxetine', 'Paroxetine', 'Citalopram', 'Escitalopram',
    'Venlafaxine', 'Duloxetine', 'Mirtazapine', 'Amitriptyline', 'Imipramine',
    'Haloperidol', 'Risperidone', 'Olanzapine', 'Quetiapine', 'Aripiprazole',
    'Clonazepam', 'Diazepam', 'Alprazolam', 'Lorazepam', 'Zolpidem',
    'Zopiclone', 'Phenobarbital', 'Lithium', 'Valproate', 'Carbamazepine'
  ],
  'Gastrointestinal': [
    'Omeprazole', 'Pantoprazole', 'Rabeprazole', 'Esomeprazole', 'Lansoprazole',
    'Ranitidine', 'Famotidine', 'Cimetidine', 'Metoclopramide', 'Domperidone',
    'Ondansetron', 'Granisetron', 'Palonosetron', 'Lactulose', 'Polyethylene Glycol',
    'Sennosides', 'Bisacodyl', 'Ispaghula Husk', 'Rifaximin', 'Norfloxacin'
  ],
  'Musculoskeletal': [
    'Ibuprofen', 'Naproxen', 'Diclofenac', 'Ketorolac', 'Mefenamic Acid',
    'Piroxicam', 'Meloxicam', 'Celecoxib', 'Etoricoxib', 'Aceclofenac',
    'Chlorzoxazone', 'Cyclobenzaprine', 'Tizanidine', 'Baclofen', 'Carisoprodol',
    'Glucosamine', 'Chondroitin', 'Calcium Carbonate + Vitamin D3', 'Alendronate', 'Risedronate'
  ],
  'Dermatological': [
    'Clindamycin', 'Mupirocin', 'Fusidic Acid', 'Silver Sulfadiazine', 'Betamethasone',
    'Clobetasol', 'Hydrocortisone', 'Mometasone', 'Triamcinolone', 'Tacrolimus',
    'Pimecrolimus', 'Salicylic Acid', 'Benzoyl Peroxide', 'Tretinoin', 'Adapalene',
    'Clotrimazole', 'Terbinafine', 'Ketoconazole', 'Itraconazole', 'Fluconazole'
  ],
  'Ophthalmic': [
    'Timolol', 'Bimatoprost', 'Latanoprost', 'Dorzolamide', 'Brinzolamide',
    'Ciprofloxacin Eye Drops', 'Ofloxacin Eye Drops', 'Tobramycin Eye Drops',
    'Gatifloxacin Eye Drops', 'Loteprednol', 'Fluorometholone', 'Prednisolone',
    'Hydroxypropyl Methylcellulose', 'Carboxymethylcellulose', 'Polyethylene Glycol'
  ],
  'Contraceptive': [
    'Levonorgestrel', 'Ethinyl Estradiol', 'Norethisterone', 'Desogestrel',
    'Drospirenone', 'Yasmin', 'Mala-D', 'Mala-N', 'Condoms', 'Copper-T'
  ],
  'Vaccine': [
    'Covishield', 'Covaxin', 'Influenza Vaccine', 'Hepatitis A Vaccine',
    'Hepatitis B Vaccine', 'Measles Vaccine', 'Rubella Vaccine', 'Polio Vaccine',
    'DPT Vaccine', 'BCG Vaccine', 'Typhoid Vaccine', 'Yellow Fever Vaccine',
    'Rabies Vaccine', 'Chickenpox Vaccine', 'Pneumococcal Vaccine'
  ],
  'Other': [
    'ORS', 'ORS + Zinc', 'Povidone Iodine', 'Chlorhexidine', 'Hydrogen Peroxide',
    'Benzyl Benzoate', 'Permethrin', 'Ivermectin', 'Albendazole', 'Mebendazole',
    'Levocarnitine', 'Silymarin', 'ursodeoxycholic Acid', 'Probiotics', 'L-Glutamine'
  ]
};

// Generate 1000 medicines
const generateMedicines = () => {
  const medicines = [];
  let id = 1;

  // Pre-defined common medicines with detailed info (100 medicines)
  const commonMedicines = [
    { name: 'Augmentin 625 Duo', generic: 'Amoxicillin + Clavulanate Potassium', brand: 'GSK', category: 'Antibiotic', dosage: 'Tablet', strength: '625mg' },
    { name: 'Azithromycin 500', generic: 'Azithromycin', brand: 'Zithromax', category: 'Antibiotic', dosage: 'Tablet', strength: '500mg' },
    { name: 'Ciprofloxacin 500', generic: 'Ciprofloxacin', brand: 'Ciproxin', category: 'Antibiotic', dosage: 'Tablet', strength: '500mg' },
    { name: 'Cefixime 200', generic: 'Cefixime', brand: 'Suprax', category: 'Antibiotic', dosage: 'Tablet', strength: '200mg' },
    { name: 'Levofloxacin 500', generic: 'Levofloxacin', brand: 'Levolet', category: 'Antibiotic', dosage: 'Tablet', strength: '500mg' },
    { name: 'Amoxicillin 500', generic: 'Amoxicillin', brand: 'Mox', category: 'Antibiotic', dosage: 'Capsule', strength: '500mg' },
    { name: 'Doxycycline 100', generic: 'Doxycycline', brand: 'Doxytet', category: 'Antibiotic', dosage: 'Capsule', strength: '100mg' },
    { name: 'Metronidazole 400', generic: 'Metronidazole', brand: 'Flagyl', category: 'Antibiotic', dosage: 'Tablet', strength: '400mg' },
    { name: 'Ceftriaxone 1g', generic: 'Ceftriaxone', brand: 'Monocef', category: 'Antibiotic', dosage: 'Injection', strength: '1g' },
    { name: 'Cloxacillin 500', generic: 'Cloxacillin', brand: 'Bonacillin', category: 'Antibiotic', dosage: 'Capsule', strength: '500mg' },
    { name: 'Crocin 500', generic: 'Paracetamol', brand: 'GSK', category: 'Analgesic', dosage: 'Tablet', strength: '500mg' },
    { name: 'Dolo 650', generic: 'Paracetamol', brand: 'Micro Labs', category: 'Analgesic', dosage: 'Tablet', strength: '650mg' },
    { name: 'Ibugesic 400', generic: 'Ibuprofen', brand: 'Cipla', category: 'Analgesic', dosage: 'Tablet', strength: '400mg' },
    { name: 'Naproxen 500', generic: 'Naproxen', brand: 'Naproxen', category: 'Analgesic', dosage: 'Tablet', strength: '500mg' },
    { name: 'Diclofenac 50', generic: 'Diclofenac', brand: 'Voveran', category: 'Analgesic', dosage: 'Tablet', strength: '50mg' },
    { name: 'Tramadol 50', generic: 'Tramadol', brand: 'Tramadol', category: 'Analgesic', dosage: 'Tablet', strength: '50mg' },
    { name: 'Combiflam', generic: 'Ibuprofen + Paracetamol', brand: 'GSK', category: 'Analgesic', dosage: 'Tablet', strength: '400mg/325mg' },
    { name: 'Sumo', generic: 'Nimesulide + Paracetamol', brand: 'Fitwel', category: 'Analgesic', dosage: 'Tablet', strength: '100mg/500mg' },
    { name: 'Calpol 650', generic: 'Paracetamol', brand: 'Calpol', category: 'Analgesic', dosage: 'Tablet', strength: '650mg' },
    { name: 'Penta 500', generic: 'Paracetamol', brand: 'Penta', category: 'Analgesic', dosage: 'Tablet', strength: '500mg' },
    { name: 'Metformin 500', generic: 'Metformin', brand: 'Glycomet', category: 'Antidiabetic', dosage: 'Tablet', strength: '500mg' },
    { name: 'Metformin 1000', generic: 'Metformin', brand: 'Glycomet', category: 'Antidiabetic', dosage: 'Tablet', strength: '1000mg' },
    { name: 'Glipizide 5', generic: 'Glipizide', brand: 'Glucotrol', category: 'Antidiabetic', dosage: 'Tablet', strength: '5mg' },
    { name: 'Glimepiride 1', generic: 'Glimepiride', brand: 'Glimy', category: 'Antidiabetic', dosage: 'Tablet', strength: '1mg' },
    { name: 'Glimepiride 2', generic: 'Glimepiride', brand: 'Glimy', category: 'Antidiabetic', dosage: 'Tablet', strength: '2mg' },
    { name: 'Janumet 50/500', generic: 'Sitagliptin + Metformin', brand: 'Janumet', category: 'Antidiabetic', dosage: 'Tablet', strength: '50mg/500mg' },
    { name: 'Voglibose 0.2', generic: 'Voglibose', brand: 'Volix', category: 'Antidiabetic', dosage: 'Tablet', strength: '0.2mg' },
    { name: 'Pioglitazone 15', generic: 'Pioglitazone', brand: 'Pioz', category: 'Antidiabetic', dosage: 'Tablet', strength: '15mg' },
    { name: 'Glibenclamide 5', generic: 'Glibenclamide', brand: 'Daonil', category: 'Antidiabetic', dosage: 'Tablet', strength: '5mg' },
    { name: 'Amlodipine 5', generic: 'Amlodipine', brand: 'Amlovas', category: 'Antihypertensive', dosage: 'Tablet', strength: '5mg' },
    { name: 'Amlodipine 10', generic: 'Amlodipine', brand: 'Amlovas', category: 'Antihypertensive', dosage: 'Tablet', strength: '10mg' },
    { name: 'Telmisartan 40', generic: 'Telmisartan', brand: 'Telma', category: 'Antihypertensive', dosage: 'Tablet', strength: '40mg' },
    { name: 'Telmisartan 80', generic: 'Telmisartan', brand: 'Telma', category: 'Antihypertensive', dosage: 'Tablet', strength: '80mg' },
    { name: 'Losartan 50', generic: 'Losartan', brand: 'Losar', category: 'Antihypertensive', dosage: 'Tablet', strength: '50mg' },
    { name: 'Ramipril 5', generic: 'Ramipril', brand: 'Cardace', category: 'Antihypertensive', dosage: 'Capsule', strength: '5mg' },
    { name: 'Metoprolol 50', generic: 'Metoprolol', brand: 'Metolar', category: 'Antihypertensive', dosage: 'Tablet', strength: '50mg' },
    { name: 'Atenolol 50', generic: 'Atenolol', brand: 'Aten', category: 'Antihypertensive', dosage: 'Tablet', strength: '50mg' },
    { name: 'Bisoprolol 5', generic: 'Bisoprolol', brand: 'Concor', category: 'Antihypertensive', dosage: 'Tablet', strength: '5mg' },
    { name: 'Olmesartan 20', generic: 'Olmesartan', brand: 'Olmezest', category: 'Antihypertensive', dosage: 'Tablet', strength: '20mg' },
    { name: 'Nebivolol 5', generic: 'Nebivolol', brand: 'Nebicip', category: 'Antihypertensive', dosage: 'Tablet', strength: '5mg' },
    { name: 'Atorvastatin 10', generic: 'Atorvastatin', brand: 'Atorva', category: 'Cardiovascular', dosage: 'Tablet', strength: '10mg' },
    { name: 'Atorvastatin 20', generic: 'Atorvastatin', brand: 'Atorva', category: 'Cardiovascular', dosage: 'Tablet', strength: '20mg' },
    { name: 'Atorvastatin 40', generic: 'Atorvastatin', brand: 'Atorva', category: 'Cardiovascular', dosage: 'Tablet', strength: '40mg' },
    { name: 'Rosuvastatin 10', generic: 'Rosuvastatin', brand: 'Razel', category: 'Cardiovascular', dosage: 'Tablet', strength: '10mg' },
    { name: 'Rosuvastatin 20', generic: 'Rosuvastatin', brand: 'Razel', category: 'Cardiovascular', dosage: 'Tablet', strength: '20mg' },
    { name: 'Simvastatin 20', generic: 'Simvastatin', brand: 'Simva', category: 'Cardiovascular', dosage: 'Tablet', strength: '20mg' },
    { name: 'Clopidogrel 75', generic: 'Clopidogrel', brand: 'Clopidogrel', category: 'Cardiovascular', dosage: 'Tablet', strength: '75mg' },
    { name: 'Aspirin 75', generic: 'Aspirin', brand: 'Aspirin', category: 'Cardiovascular', dosage: 'Tablet', strength: '75mg' },
    { name: 'Aspirin 150', generic: 'Aspirin', brand: 'Aspirin', category: 'Cardiovascular', dosage: 'Tablet', strength: '150mg' },
    { name: 'Cetirizine 10', generic: 'Cetirizine', brand: 'Cetrizine', category: 'Antihistamine', dosage: 'Tablet', strength: '10mg' },
    { name: 'Loratadine 10', generic: 'Loratadine', brand: 'Loratadine', category: 'Antihistamine', dosage: 'Tablet', strength: '10mg' },
    { name: 'Fexofenadine 120', generic: 'Fexofenadine', brand: 'Fexofenadine', category: 'Antihistamine', dosage: 'Tablet', strength: '120mg' },
    { name: 'Levocetirizine 5', generic: 'Levocetirizine', brand: 'Levocet', category: 'Antihistamine', dosage: 'Tablet', strength: '5mg' },
    { name: 'Montelukast 10', generic: 'Montelukast', brand: 'Montair', category: 'Respiratory', dosage: 'Tablet', strength: '10mg' },
    { name: 'Asthalin Inhaler', generic: 'Salbutamol', brand: 'Asthalin', category: 'Respiratory', dosage: 'Inhaler', strength: '100mcg' },
    { name: 'Budecort Inhaler', generic: 'Budesonide', brand: 'Budecort', category: 'Respiratory', dosage: 'Inhaler', strength: '200mcg' },
    { name: 'Deriphyllin Retard', generic: 'Theophylline + Etophylline', brand: 'Deriphyllin', category: 'Respiratory', dosage: 'Tablet', strength: '150mg' },
    { name: 'Omeprazole 20', generic: 'Omeprazole', brand: 'Omez', category: 'Antacid', dosage: 'Capsule', strength: '20mg' },
    { name: 'Omeprazole 40', generic: 'Omeprazole', brand: 'Omez', category: 'Antacid', dosage: 'Capsule', strength: '40mg' },
    { name: 'Pantoprazole 40', generic: 'Pantoprazole', brand: 'Pan', category: 'Antacid', dosage: 'Tablet', strength: '40mg' },
    { name: 'Rabeprazole 20', generic: 'Rabeprazole', brand: 'Rabeprazole', category: 'Antacid', dosage: 'Tablet', strength: '20mg' },
    { name: 'Domperidone 10', generic: 'Domperidone', brand: 'Domperidone', category: 'Antacid', dosage: 'Tablet', strength: '10mg' },
    { name: 'Ondansetron 4', generic: 'Ondansetron', brand: 'Emeset', category: 'Antacid', dosage: 'Tablet', strength: '4mg' },
    { name: 'Pantoprazole 40', generic: 'Pantoprazole + Domperidone', brand: 'Pan-D', category: 'Antacid', dosage: 'Capsule', strength: '40mg/30mg' },
    { name: 'Escitalopram 10', generic: 'Escitalopram', brand: 'Cited', category: 'Psychiatric', dosage: 'Tablet', strength: '10mg' },
    { name: 'Sertraline 50', generic: 'Sertraline', brand: 'Sertraline', category: 'Psychiatric', dosage: 'Tablet', strength: '50mg' },
    { name: 'Fluoxetine 20', generic: 'Fluoxetine', brand: 'Fluoxetine', category: 'Psychiatric', dosage: 'Capsule', strength: '20mg' },
    { name: 'Duloxetine 20', generic: 'Duloxetine', brand: 'Duloxetine', category: 'Psychiatric', dosage: 'Capsule', strength: '20mg' },
    { name: 'Alprazolam 0.25', generic: 'Alprazolam', brand: 'Alprazolam', category: 'Psychiatric', dosage: 'Tablet', strength: '0.25mg' },
    { name: 'Alprazolam 0.5', generic: 'Alprazolam', brand: 'Alprazolam', category: 'Psychiatric', dosage: 'Tablet', strength: '0.5mg' },
    { name: 'Clonazepam 0.5', generic: 'Clonazepam', brand: 'Clonazepam', category: 'Psychiatric', dosage: 'Tablet', strength: '0.5mg' },
    { name: 'Gabapentin 300', generic: 'Gabapentin', brand: 'Gabapentin', category: 'Neurological', dosage: 'Capsule', strength: '300mg' },
    { name: 'Pregabalin 75', generic: 'Pregabalin', brand: 'Pregabalin', category: 'Neurological', dosage: 'Capsule', strength: '75mg' },
    { name: 'Carbamazepine 200', generic: 'Carbamazepine', brand: 'Carbamazepine', category: 'Neurological', dosage: 'Tablet', strength: '200mg' },
    { name: 'Levetiracetam 500', generic: 'Levetiracetam', brand: 'Levetiracetam', category: 'Neurological', dosage: 'Tablet', strength: '500mg' },
    { name: 'Phenytoin 100', generic: 'Phenytoin', brand: 'Phenytoin', category: 'Neurological', dosage: 'Tablet', strength: '100mg' },
    { name: 'Valproic Acid 200', generic: 'Valproic Acid', brand: 'Valproic Acid', category: 'Neurological', dosage: 'Tablet', strength: '200mg' },
    { name: 'Levodopa 100', generic: 'Levodopa + Carbidopa', brand: 'Syndopa', category: 'Neurological', dosage: 'Tablet', strength: '100mg/10mg' },
    { name: 'Trihexyphenidyl 2', generic: 'Trihexyphenidyl', brand: 'Trihexy', category: 'Neurological', dosage: 'Tablet', strength: '2mg' },
    { name: 'Methylphenidate 10', generic: 'Methylphenidate', brand: 'Methylphenidate', category: 'Neurological', dosage: 'Tablet', strength: '10mg' },
    { name: 'Calcium Carbonate 500', generic: 'Calcium Carbonate', brand: 'Calcium', category: 'Vitamin/Supplement', dosage: 'Tablet', strength: '500mg' },
    { name: 'Vitamin D3 1000', generic: 'Cholecalciferol', brand: 'D3', category: 'Vitamin/Supplement', dosage: 'Tablet', strength: '1000IU' },
    { name: 'Vitamin B Complex', generic: 'Vitamin B Complex', brand: 'B Complex', category: 'Vitamin/Supplement', dosage: 'Tablet', strength: 'N/A' },
    { name: 'Iron + Folic Acid', generic: 'Ferrous Sulfate + Folic Acid', brand: 'Iron', category: 'Vitamin/Supplement', dosage: 'Tablet', strength: '60mg/0.5mg' },
    { name: 'Zinc 50', generic: 'Zinc', brand: 'Zinc', category: 'Vitamin/Supplement', dosage: 'Tablet', strength: '50mg' },
    { name: 'Folic Acid 5', generic: 'Folic Acid', brand: 'Folic Acid', category: 'Vitamin/Supplement', dosage: 'Tablet', strength: '5mg' },
    { name: 'Mecobalamin 500', generic: 'Mecobalamin', brand: 'Mecobalamin', category: 'Vitamin/Supplement', dosage: 'Tablet', strength: '500mcg' },
    { name: 'Alpha Lipoic Acid 100', generic: 'Alpha Lipoic Acid', brand: 'ALA', category: 'Vitamin/Supplement', dosage: 'Capsule', strength: '100mg' },
    { name: 'Multivitamin', generic: 'Multivitamins', brand: 'Multivitamin', category: 'Vitamin/Supplement', dosage: 'Tablet', strength: 'N/A' },
    { name: 'Mupirocin Cream', generic: 'Mupirocin', brand: 'Mupirocin', category: 'Dermatological', dosage: 'Cream', strength: '2%' },
    { name: 'Clotrimazole Cream', generic: 'Clotrimazole', brand: 'Clotrimazole', category: 'Dermatological', dosage: 'Cream', strength: '1%' },
    { name: 'Betamethasone Cream', generic: 'Betamethasone', brand: 'Betamethasone', category: 'Dermatological', dosage: 'Cream', strength: '0.05%' },
    { name: 'Silver Sulfadiazine', generic: 'Silver Sulfadiazine', brand: 'Silvadene', category: 'Dermatological', dosage: 'Cream', strength: '1%' },
    { name: 'Diclofenac Gel', generic: 'Diclofenac', brand: 'Diclofenac Gel', category: 'Dermatological', dosage: 'Gel', strength: '1%' },
    { name: 'Timolol Eye Drops', generic: 'Timolol', brand: 'Timolol', category: 'Ophthalmic', dosage: 'Drops', strength: '0.5%' },
    { name: 'Ciprofloxacin Eye Drops', generic: 'Ciprofloxacin', brand: 'Ciprofloxacin', category: 'Ophthalmic', dosage: 'Drops', strength: '0.3%' },
    { name: 'Prednisolone Eye Drops', generic: 'Prednisolone', brand: 'Prednisolone', category: 'Ophthalmic', dosage: 'Drops', strength: '1%' },
    { name: 'Cataract Eye Drops', generic: 'Carboxymethylcellulose', brand: 'Refresh', category: 'Ophthalmic', dosage: 'Drops', strength: '0.5%' },
    { name: 'ORS Packet', generic: 'ORS', brand: 'Electral', category: 'Other', dosage: 'Other', strength: '20.5g' },
    { name: 'ORS with Zinc', generic: 'ORS + Zinc', brand: 'Electral', category: 'Other', dosage: 'Other', strength: '20.5g+10mg' },
    { name: 'Povidone Iodine', generic: 'Povidone Iodine', brand: 'Betadine', category: 'Other', dosage: 'Solution', strength: '5%' }
  ];

  // Add common medicines first
  commonMedicines.forEach((med) => {
    medicines.push({
      name: med.name,
      genericName: med.generic,
      brand: med.brand,
      manufacturer: companies[Math.floor(Math.random() * companies.length)],
      category: med.category,
      composition: `${med.generic} ${med.strength}`,
      dosageForm: med.dosage,
      strength: med.strength,
      packageSize: med.dosage === 'Tablet' || med.dosage === 'Capsule' ? `${Math.floor(Math.random() * 10) + 5} tablets/strip` : 
                  med.dosage === 'Injection' ? '1 vial' : 
                  med.dosage === 'Syrup' || med.dosage === 'Solution' ? `${Math.floor(Math.random() * 100) + 30}ml` : '1 unit',
      licenseNumber: `LIC/${id}/${new Date().getFullYear()}/IN`,
      scheduleType: ['Antibiotic', 'Antiviral', 'Oncology', 'Psychiatric', 'Contraceptive'].includes(med.category) ? 'H' : 
                    ['Antihypertensive', 'Antidiabetic', 'Cardiovascular', 'Neurological'].includes(med.category) ? 'H1' : 'OTC',
      physicalFeatures: generatePhysicalFeatures(med.dosage),
      packagingFeatures: { hologramPresent: Math.random() > 0.5, barcodePresent: true, colorDescription: 'Standard packaging' },
      isVerified: true,
      riskLevel: ['Antibiotic', 'Antiviral', 'Oncology', 'Psychiatric'].includes(med.category) ? 'high' : 'medium'
    });
    id++;
  });

  // Generate remaining medicines programmatically (900 more to reach 1000)
  while (medicines.length < 1000) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const compList = compositions[category] || compositions['Other'];
    const composition = compList[Math.floor(Math.random() * compList.length)];
    const dosage = dosageForms[Math.floor(Math.random() * dosageForms.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    
    // Generate different strengths based on category
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
};

// Helper functions
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
  return list[Math.floor(Math.random() * list.length)] + (category.includes('Vitamin') && !list.includes('mg') ? 'IU' : 'mg');
}

function generateBrandName(composition) {
  const prefixes = ['Al', 'Ar', 'Bi', 'Ci', 'Co', 'De', 'Di', 'El', 'Em', 'Ex', 'Fa', 'Gl', 'He', 'In', 'La', 'Le', 'Li', 'Lu', 'Ma', 'Me', 'Mo', 'Ne', 'Nu', 'Pa', 'Ph', 'Po', 'Pr', 'Ra', 'Re', 'Ri', 'Ro', 'Ru', 'Se', 'Si', 'So', 'Sp', 'Su', 'Ta', 'Te', 'Ti', 'Tr', 'Va', 'Vi', 'Vo', 'Ze', 'Zy'];
  const suffixes = ['a', 'o', 'ex', 'in', 'ol', 'al', 'il', 'ide', 'ate', 'ol', 'x', 'zin', 'p', 'm', 'n', 'v', 'B', 'C', 'D', 'F', 'G', 'L', 'M', 'P', 'R', 'S', 'T', 'V', 'X', 'Z'];
  
  // Use actual brand names when possible
  const knownBrands = {
    'Metformin': ['Glycomet', 'Metformin', 'Gluconorm', 'Bigmet'],
    'Amlodipine': ['Amlovas', 'Amlodipine', 'Amlip'],
    'Omeprazole': ['Omez', 'Omeprazole', 'O'],
    'Cetirizine': ['Cetrizine', 'Cetirizine', 'Alerid'],
    'Azithromycin': ['Azithral', 'Azithromycin', 'Zithromax'],
    'Paracetamol': ['Crocin', 'Dolo', 'Calpol', 'Penta'],
    'Ibuprofen': ['Ibugesic', 'Ibuprofen', 'Brufen'],
    'Atorvastatin': ['Atorva', 'Atorvastatin', 'Azor'],
    'Montelukast': ['Montair', 'Montelukast', 'Singulair'],
    'Levofloxacin': ['Levolet', 'Levofloxacin', 'Levaquin']
  };
  
  if (knownBrands[composition]) {
    return knownBrands[composition][Math.floor(Math.random() * knownBrands[composition].length)];
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
    case 'Solution':
    case 'Suspension':
      const ml = [30, 60, 100, 120, 150, 200, 250];
      return `${ml[Math.floor(Math.random() * ml.length)]}ml`;
    case 'Injection':
      return `${[1, 2, 5, 10][Math.floor(Math.random() * 4)]}ml vial`;
    case 'Cream':
    case 'Ointment':
    case 'Gel':
      return `${[5, 10, 15, 20, 30, 50][Math.floor(Math.random() * 6)]}g tube`;
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
  const scheduleH1 = ['Antihypertensive', 'Antidiabetic', 'Respiratory', 'Immunosuppressant', 'Musculoskeletal'];
  
  if (scheduleH.includes(category)) return 'H';
  if (scheduleH1.includes(category)) return 'H1';
  if (category === 'Vaccine') return 'X';
  if (category === 'Vitamin/Supplement' || category === 'Antacid' || category === 'Other') return 'OTC';
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
  if (['Cream', 'Ointment', 'Gel'].includes(dosage)) {
    return {
      color: colors.slice(0, 6).join(', '),
      specialMarking: 'Tube'
    };
  }
  if (['Syrup', 'Solution', 'Suspension', 'Drops'].includes(dosage)) {
    return {
      color: colors[Math.floor(Math.random() * colors.length)],
      specialMarking: 'Bottle'
    };
  }
  if (dosage === 'Injection') {
    return {
      color: 'White powder/Liquid',
      specialMarking: 'Vial/Ampoule'
    };
  }
  return {};
}

const seedDB = async () => {
  try {
    await connectDB();
    
    // Clear existing medicines
    await Medicine.deleteMany({});
    console.log('🗑️  Cleared existing medicines');

    // Generate and insert medicines
    const medicines = generateMedicines();
    const inserted = await Medicine.insertMany(medicines);
    console.log(`✅ Seeded ${inserted.length} medicines`);

    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@medverify.in' });
    if (!adminExists) {
      await User.create({
        name: 'MedVerify Admin',
        email: 'admin@medverify.in',
        password: 'Admin@MedVerify2024',
        role: 'admin',
        isEmailVerified: true,
        state: 'Delhi',
        city: 'New Delhi'
      });
      console.log('✅ Admin user created: admin@medverify.in / Admin@MedVerify2024');
    }

    console.log('🌱 Database seeded with 1000 medicines successfully!');
    console.log(`📊 Categories: ${categories.join(', ')}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDB();
}

module.exports = { seedDB, generateMedicines };
