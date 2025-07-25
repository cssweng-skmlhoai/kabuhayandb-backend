import * as MembersService from '../services/members.services.js';

export async function getMembers(req, res) {
  try {
    const members = await MembersService.getMembers();

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMembersHome(req, res) {
  try {
    const name = req.query.name;
    if (name) {
      const members = await MembersService.getMembersHomeByName(name);
      return res.status(200).json(members);
    }

    const members = await MembersService.getMembersHome();
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMembersById(req, res) {
  try {
    const id = req.params.id;
    const member = await MembersService.getMemberById(id);

    // checks if member exists
    if (member) res.status(200).json(member);
    else res.status(404).json({ message: `No member found with id: ${id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createMembers(req, res) {
  try {
    const data = {
      ...req.body,
      confirmity_signature: req.file?.buffer || null,
    };
    const created_member = await MembersService.createMembers(data);

    res.status(201).json(created_member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateMembers(req, res) {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      confirmity_signature: req.file?.buffer || null,
    };
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

export async function updateMemberMultiple(req, res) {
  try {
    const memberId = req.params.id;
    const updates = {
      ...req.body,
      confirmity_signature: req.file?.buffer || null,
    };

    const result = await MembersService.updateMemberMultiple(memberId, updates);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: `No member found with id: ${memberId}` });
    } else {
      res
        .status(200)
        .json({ success: true, affected_rows: result.affectedRows });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMemberInfoById(req, res) {
  try {
    const member_id = req.params.id;

    const member = await MembersService.getMemberInfoById(member_id);

    if (!member)
      return res
        .status(404)
        .json({ message: `No member found with id: ${member_id}` });

    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateMemberInfo(req, res) {
  try {
    const member_id = req.params.id;
    const bodyData =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const payload = {
      members: {
        ...bodyData,
        confirmity_signature: req.file?.buffer || null,
      },
      ...(bodyData.families && { families: bodyData.families }),
      ...(bodyData.households && { households: bodyData.households }),
      ...(bodyData.family_members && {
        family_members: bodyData.family_members,
      }),
    };

    const result = await MembersService.updateMemberInfo(member_id, payload);

    if (!result)
      return res
        .status(404)
        .json({ message: `No member found with id: ${member_id}` });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createMemberInfo(req, res) {
  try {
    const bodyData =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const payload = {
      members: {
        ...bodyData,
        confirmity_signature: req.file?.buffer || null,
      },
      ...(bodyData.families && { families: bodyData.families }),
      ...(bodyData.households && { households: bodyData.households }),
      ...(bodyData.family_members && {
        family_members: bodyData.family_members,
      }),
    };
    const result = await MembersService.createMemberInfo(payload);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
