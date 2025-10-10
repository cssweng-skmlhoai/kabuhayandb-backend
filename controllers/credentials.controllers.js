import * as CredentialsService from '../services/credentials.services.js';

export async function getCredentials(req, res) {
  try {
    const username = req.query.username;

    if (username) {
      const credentials =
        await CredentialsService.getCredentialsByName(username);
      credentials.forEach((c) => delete c.password);

      return res.status(200).json(credentials);
    }
    const credentials = await CredentialsService.getCredentials();
    credentials.forEach((c) => delete c.password);

    res.status(200).json(credentials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCredentialsById(req, res) {
  try {
    const id = req.params.id;
    const credential = await CredentialsService.getCredentialsById(id);

    if (credential) {
      delete credential.password;
      res.status(200).json(credential);
    } else {
      res.status(404).json({ message: `No credential found with id: ${id}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCredentialsByMemberId(req, res) {
  try {
    const id = req.params.id;
    const credential = await CredentialsService.getCredentialsByMemberId(id);

    if (credential) {
      delete credential.password;
      res.status(200).json(credential);
    } else {
      res.status(404).json({ message: `No credential found with id: ${id}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createCredentials(req, res) {
  try {
    const data = req.body;
    const created_credential = await CredentialsService.createCredentials(data);

    res.status(201).json(created_credential);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateCredentials(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await CredentialsService.updateCredentials(id, updates);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: `No credential found with id: ${id}` });
    } else {
      res
        .status(200)
        .json({ success: true, affected_rows: result.affectedRows });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteCredentials(req, res) {
  try {
    const { id } = req.params;
    const affected_rows = await CredentialsService.deleteCredentials(id);

    if (affected_rows === 0) {
      res.status(404).json({ message: `No credential found with id: ${id}` });
    } else {
      res.status(200).json({ success: true, affected_rows });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function verifyLogin(req, res) {
  try {
    const { username, password } = req.body;
    const user = await CredentialsService.verifyLogin(username, password);

    if (!user) {
      res.status(401).json({ message: 'Invalid username or password.' });
    } else {
      res.status(200).json({ message: 'Login successful.', user });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function changePassword(req, res) {
  try {
    const id = req.params.id;
    const { current_password, new_password } = req.body;

    const result = await CredentialsService.changePassword(
      id,
      current_password,
      new_password
    );

    if (result === 0) {
      res.status(404).json({ message: `No credential found with id: ${id}` });
    } else {
      res.status(200).json({ success: true, result });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    const result = await CredentialsService.requestPasswordReset(email);

    if (result === 0) {
      res.status(404).json({ message: `Email cannot be sent: ${email}` }); // change as needed
    } else {
      res.status(200).json({ success: true, result });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const token = req.params.token;
    const { new_password } = req.body;

    const result = await CredentialsService.resetPassword(token, new_password);

    if (result === 0) {
      res.status(404).json({ message: `Not a valid token: ${token}` });
    } else {
      res.status(200).json({ success: true, result });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
