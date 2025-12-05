import * as ChangesService from '../services/changes.services.js';

export async function getChanges(req, res) {
  try {
    const { page, limit, search, dateFrom, dateTo } = req.query;
    const changes = await ChangesService.getChanges({
      page,
      limit,
      search,
      dateFrom,
      dateTo,
    });
    res.status(200).json({ success: true, changes: changes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
