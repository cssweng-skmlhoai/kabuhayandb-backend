import * as CredentialsService from '../services/credentials.services.js';
import { transporter } from '../config/email.js';

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

export async function verifyResetToken(req, res) {
  try {
    const { token } = req.query;

    const user = await CredentialsService.verifyResetToken(token);

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired reset token.' });
    }

    res.status(200).json({ message: 'Valid reset token.', user_id: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const data = await CredentialsService.createPasswordResetToken(email);

    if (!data) {
      return res.status(200).json({
        message:
          'If the email exists on file, a password reset link has been sent.',
      });
    }

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${data.token}`;

    const mailOptions = {
      from: `"SKMLHOAI" <${process.env.OAUTH_EMAIL}>`,
      to: email,
      subject: 'Password Reset',
      html: `
        <p>You requested a password reset.</p>
        <p>Click this link:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Expires in 15 minutes.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('[PasswordReset] Mail sent', {
      to: email,
      messageId: info?.messageId,
    });

    return res.status(200).json({ message: 'Reset email sent', resetLink });
  } catch (error) {
    console.error('[PasswordReset] Failed to send reset email:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function confirmPasswordReset(req, res) {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ message: 'Missing token or password' });
    }

    const success = await CredentialsService.resetPasswordWithToken(
      token,
      new_password
    );

    if (!success) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
