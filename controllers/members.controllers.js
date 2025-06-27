import * as MembersService from '../services/members.services.js';

export async function getMembers(req, res) {
  try {
    const members = await MembersService.getMembers();

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMembersById(req, res) {
  try {
    const { id } = req.params.id;
    const member = await MembersService.getmemberById(id);

    // checks if member exists
    if (member) res.status(200).json(member);
    else res.status(404).json({ message: `No member found with id: ${id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createMembers(req, res) {
  try {
    const data = req.body;
    const created_member = await MembersService.createMembers(data);

    res.status(201).json(created_member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateMembers(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await MembersService.updateMembers(id, updates);

    // checks if member is found given id
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

export async function deleteMembers(req, res) {
  try {
    const { id } = req.params;
    const affected_rows = await MembersService.deleteMembers(id);

    // checks if member is found
    if (affected_rows === 0) {
      res.status(404).json({ message: `No member found with id: ${id}` });
    } else {
      res.status(200).json({ success: true, affected_rows });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMemberByName(req, res) {
  try {
    const first_name = req.params.first;
    const last_name = req.params.last;

    const result = await MembersService.getMemberByName(first_name, last_name);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        message: `No member found with name: ${first_name} ${last_name}`,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
