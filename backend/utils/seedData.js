const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Medicine = require('../models/Medicine');
const User = require('../models/User');
const connectDB = require('../config/db');

const medicines = [
  {
    name: 'Augmentin 625',
    genericName: 'Amoxicillin + Clavulanate Potassium',
    brand: 'GSK',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
    category: 'Antibiotic',
    composition: 'Amoxicillin 500mg + Clavulanate 125mg',
    dosageForm: 'Tablet',
    strength: '625mg',
    packageSize: '10 tablets/strip',
    licenseNumber: 'KD/29/2/96/DL',
    scheduleType: 'H',
    physicalFeatures: { color: 'White', shape: 'Oval', imprint: 'AC 625', coating: 'Film coated' },
    packagingFeatures: { hologramPresent: true, barcodePresent: true, colorDescription: 'White strip with blue logo' },
    isVerified: true,
    riskLevel: 'high'
  },
  {
    name: 'Crocin 500',
    genericName: 'Paracetamol',
    brand: 'GSK',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
    category: 'Analgesic',
    composition: 'Paracetamol 500mg',
    dosageForm: 'Tablet',
    strength: '500mg',
    packageSize: '15 tablets/strip',
    scheduleType: 'OTC',
    physicalFeatures: { color: 'White', shape: 'Round', imprint: 'CROCIN 500', coating: 'Uncoated' },
    packagingFeatures: { hologramPresent: false, barcodePresent: true, colorDescription: 'Red and white strip' },
    isVerified: true,
    riskLevel: 'medium'
  },
  {
    name: 'Betnovate-C Cream',
    genericName: 'Betamethasone + Clioquinol',
    brand: 'GSK',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
    category: 'Other',
    composition: 'Betamethasone Valerate 0.1% + Clioquinol 3%',
    dosageForm: 'Cream',
    strength: '0.1%/3%',
    packageSize: '20g tube',
    scheduleType: 'H',
    physicalFeatures: { color: 'White cream', coating: 'N/A', specialMarking: 'GSK logo on tube' },
    packagingFeatures: { hologramPresent: true, barcodePresent: true, colorDescription: 'White tube with orange/red label' },
    isVerified: true,
    riskLevel: 'critical',
    isFlaggedAsFake: true,
    reportCount: 8
  },
  {
    name: 'Janumet 50/500',
    genericName: 'Sitagliptin + Metformin',
    brand: 'MSD',
    manufacturer: 'MSD Pharmaceuticals Pvt Ltd',
    category: 'Antidiabetic',
    composition: 'Sitagliptin 50mg + Metformin 500mg',
    dosageForm: 'Tablet',
    strength: '50mg/500mg',
    packageSize: '14 tablets/strip',
    scheduleType: 'H',
    physicalFeatures: { color: 'Light pink', shape: 'Capsule-shaped', imprint: '575', coating: 'Film coated' },
    packagingFeatures: { hologramPresent: true, barcodePresent: true, colorDescription: 'Red and white packaging' },
    isVerified: true,
    riskLevel: 'critical',
    isFlaggedAsFake: true,
    reportCount: 12
  },
  {
    name: 'Allegra 180',
    genericName: 'Fexofenadine',
    brand: 'Sanofi',
    manufacturer: 'Sanofi India Ltd',
    category: 'Antihistamine',
    composition: 'Fexofenadine Hydrochloride 180mg',
    dosageForm: 'Tablet',
    strength: '180mg',
    packageSize: '10 tablets/strip',
    scheduleType: 'H',
    physicalFeatures: { color: 'Peach/Orange', shape: 'Oval', imprint: '018', coating: 'Film coated' },
    packagingFeatures: { hologramPresent: false, barcodePresent: true, colorDescription: 'Orange and white strip' },
    isVerified: true,
    riskLevel: 'high',
    reportCount: 5
  },
  {
    name: 'Cardace 5',
    genericName: 'Ramipril',
    brand: 'Sanofi',
    manufacturer: 'Sanofi India Ltd',
    category: 'Antihypertensive',
    composition: 'Ramipril 5mg',
    dosageForm: 'Capsule',
    strength: '5mg',
    packageSize: '10 capsules/strip',
    scheduleType: 'H',
    physicalFeatures: { color: 'Yellow/White capsule', shape: 'Capsule' },
    packagingFeatures: { hologramPresent: true, barcodePresent: true, colorDescription: 'Blue and white packaging' },
    isVerified: true,
    riskLevel: 'high',
    reportCount: 4
  },
  {
    name: 'ENO Antacid',
    genericName: 'Sodium Bicarbonate + Citric Acid',
    brand: 'GSK',
    manufacturer: 'GlaxoSmithKline Consumer Healthcare Ltd',
    category: 'Antacid',
    composition: 'Sodium Bicarbonate 2.32g + Citric Acid 2.18g per 5g sachet',
    dosageForm: 'Other',
    strength: '5g/sachet',
    packageSize: '30 sachets/pack',
    scheduleType: 'OTC',
    physicalFeatures: { color: 'White powder', specialMarking: 'Orange flavor: orange granules visible' },
    packagingFeatures: { hologramPresent: false, barcodePresent: true, colorDescription: 'Orange sachet with ENO logo' },
    isVerified: true,
    riskLevel: 'critical',
    isFlaggedAsFake: true,
    reportCount: 15
  },
  {
    name: 'Levofloxacin 500',
    genericName: 'Levofloxacin',
    brand: 'Sun Pharma',
    manufacturer: 'Sun Pharmaceutical Industries Ltd',
    category: 'Antibiotic',
    composition: 'Levofloxacin 500mg',
    dosageForm: 'Tablet',
    strength: '500mg',
    packageSize: '5 tablets/strip',
    scheduleType: 'H',
    physicalFeatures: { color: 'Light orange', shape: 'Oval', coating: 'Film coated' },
    packagingFeatures: { hologramPresent: false, barcodePresent: true },
    isVerified: true,
    riskLevel: 'medium'
  },
  {
    name: 'Asthalin Inhaler',
    genericName: 'Salbutamol',
    brand: 'Cipla',
    manufacturer: 'Cipla Ltd',
    category: 'Respiratory',
    composition: 'Salbutamol 100mcg/actuation',
    dosageForm: 'Inhaler',
    strength: '100mcg',
    packageSize: '200 actuations',
    scheduleType: 'H',
    physicalFeatures: { color: 'Blue inhaler', specialMarking: 'Cipla logo, dose counter' },
    packagingFeatures: { hologramPresent: true, barcodePresent: true, securitySealPresent: true, colorDescription: 'Blue inhaler body' },
    isVerified: true,
    riskLevel: 'high',
    reportCount: 3
  },
  {
    name: 'Ecosprin 75',
    genericName: 'Aspirin',
    brand: 'USV',
    manufacturer: 'USV Pvt Ltd',
    category: 'Cardiovascular',
    composition: 'Aspirin 75mg',
    dosageForm: 'Tablet',
    strength: '75mg',
    packageSize: '14 tablets/strip',
    scheduleType: 'H',
    physicalFeatures: { color: 'White', shape: 'Round', coating: 'Enteric coated' },
    packagingFeatures: { hologramPresent: false, barcodePresent: true },
    isVerified: true,
    riskLevel: 'low'
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    
    // Clear existing
    await Medicine.deleteMany({});
    console.log('🗑️  Cleared existing medicines');

    // Insert seed data
    const inserted = await Medicine.insertMany(medicines);
    console.log(`✅ Seeded ${inserted.length} medicines`);

    // Create admin user
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

    console.log('🌱 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedDB();
