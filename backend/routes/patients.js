import express from 'express';
import Patient from '../models/Patient.js';

const router = express.Router();

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, age, symptoms } = req.body;

    // Basic validation
    if (!name || !age || !symptoms) {
      res.status(400);
      throw new Error('Please include all required fields');
    }

    const patient = new Patient({
      name,
      age,
      symptoms
    });

    const createdPatient = await patient.save();
    res.status(201).json(createdPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all patients
// @route   GET /api/patients
// @access  Public
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (patient) {
      res.json(patient);
    } else {
      res.status(404);
      throw new Error('Patient not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a patient
// @route   PUT /api/patients/:id
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const { name, age, symptoms } = req.body;

    const patient = await Patient.findById(req.params.id);

    if (patient) {
      patient.name = name || patient.name;
      patient.age = age || patient.age;
      patient.symptoms = symptoms || patient.symptoms;

      const updatedPatient = await patient.save();
      res.json(updatedPatient);
    } else {
      res.status(404);
      throw new Error('Patient not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a patient
// @route   DELETE /api/patients/:id
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (patient) {
      await patient.remove();
      res.json({ message: 'Patient removed' });
    } else {
      res.status(404);
      throw new Error('Patient not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
