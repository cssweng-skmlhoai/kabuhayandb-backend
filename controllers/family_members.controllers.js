import * as FamilyMembersService from '../services/family_members.services.js';

export async function getFamilyMembers(req, res) {
  try {
    const family_members = await FamilyMembersService.getFamilyMembers();
    res.status(200).json(family_members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getFamilyMemberById(req, res) {
  try {
    const { id } = req.params.id;
    const family_member = await FamilyMembersService.getFamilyMemberById(id);

    if (family_member) res.status(200).json(family_member);
    else res.status(404).json({ message: `No member found with id: ${id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createFamilyMember(req, res) {
  try {
    const data = req.body;
    const created_family_member =
      await FamilyMembersService.createFamilyMember(data);

    res.status(201).json(created_family_member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateFamilyMembers(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await FamilyMembersService.updateFamilyMember(id, updates);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: `No member found with id: ${id}` });
    } else {
      res
        .status(200)
        .json({ success: true, affected_rows: result.affectedRows });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteFamilyMembers(req, res) {
  try {
    const { id } = req.params;
    const affected_rows = await FamilyMembersService.deleteFamilyMembers(id);

    if (affected_rows === 0) {
      res.status(404).json({ message: `No member found with id: ${id}` });
    } else {
      res.status(200).json({ success: true, affected_rows });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
