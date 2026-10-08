const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  const email = value.trim().toLowerCase();

  if (email.length === 0) {
    return 'Ingresa tu correo electrónico.';
  }

  if (email.length > 320 || !emailPattern.test(email)) {
    return 'Ingresa un correo electrónico válido.';
  }

  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (value.length === 0) {
    return 'Ingresa tu contraseña.';
  }

  if (value.length < 8 || value.length > 128) {
    return 'La contraseña debe tener entre 8 y 128 caracteres.';
  }

  return undefined;
}

export function validateName(value: string): string | undefined {
  const name = value.trim();

  if (name.length === 0) {
    return 'Ingresa tu nombre.';
  }

  if (name.length < 2 || name.length > 100) {
    return 'El nombre debe tener entre 2 y 100 caracteres.';
  }

  return undefined;
}

function validateMeasurement(
  value: string,
  { emptyMessage, rangeMessage, min, max }: {
    emptyMessage: string;
    rangeMessage: string;
    min: number;
    max: number;
  },
): string | undefined {
  if (value.trim().length === 0) {
    return emptyMessage;
  }

  const measurement = Number(value);

  if (!Number.isFinite(measurement) || measurement < min || measurement > max) {
    return rangeMessage;
  }

  return undefined;
}

export function validateHeight(value: string): string | undefined {
  return validateMeasurement(value, {
    emptyMessage: 'Ingresa tu altura.',
    rangeMessage: 'Ingresa una altura entre 100 y 250 cm.',
    min: 100,
    max: 250,
  });
}

export function validateWeight(value: string): string | undefined {
  return validateMeasurement(value, {
    emptyMessage: 'Ingresa tu peso.',
    rangeMessage: 'Ingresa un peso entre 30 y 300 kg.',
    min: 30,
    max: 300,
  });
}
