import 'dotenv/config';

export function authenticateApiSecret(req, res, next) {
  const auth_header = req.headers['authorization'];

  // checks if authorization header exists and with correct formatting
  if (!auth_header || !auth_header.startsWith('Bearer '))
    return res
      .status(401)
      .json({ message: 'Unauthorized: No token provided.' });

  const token = auth_header.split(' ')[1];

  // checks if API token is the same with ours
  if (token !== process.env.API_SECRET)
    return res.status(403).json({ error: 'Invalid API token' });

  next();
}
