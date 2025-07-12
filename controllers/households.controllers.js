import * as HouseholdsService from '../services/households.services.js';

export async function getHouseholds(req, res) {
  try {
    const households = await HouseholdsService.getHouseholds();

    res.status(200).json(households);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getHouseholdsById(req, res) {
  try {
    const { id } = req.params.id;
    const household = await HouseholdsService.gethouseholdById(id);

    // checks if household exists
    if (household) res.status(200).json(household);
    else res.status(404).json({ message: `No household found with id: ${id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createHouseholds(req, res) {
  try {
    const data = req.body;
    const created_household = await HouseholdsService.createHouseholds(data);

    res.status(201).json(created_household);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateHouseholds(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await HouseholdsService.updateHouseholds(id, updates);

    // checks if household is found given id
    if (result.affectedRows === 0) {
      res.status(404).json({ message: `No household found with id: ${id}` });
    } else {
      res
        .status(200)
        .json({ success: true, affected_rows: result.affectedRows });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteHouseholds(req, res) {
  try {
    const { id } = req.params;
    const affected_rows = await HouseholdsService.deleteHouseholds(id);

    // checks if household is found
    if (affected_rows === 0) {
      res.status(404).json({ message: `No household found with id: ${id}` });
    } else {
      res.status(200).json({ success: true, affected_rows });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
