import { useState } from 'react';

type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

const DEFAULT_FORM_DATA: ContactFormData = { name: '', email: '', message: '' };
const DEFAULT_STATUS = 'Transmit Signal';

export function useContactForm() {
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [formData, setFormData] = useState<ContactFormData>(DEFAULT_FORM_DATA);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('Transmitting...');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setStatus('Signal Received');
        setFormData(DEFAULT_FORM_DATA);
      } else {
        setStatus('Transmission Failed');
      }
    } catch (error) {
      console.error('Transmission Error:', error);
      setStatus('Connection Error');
    } finally {
      setTimeout(() => setStatus(DEFAULT_STATUS), 3000);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return { status, formData, handleSubmit, handleChange };
}
