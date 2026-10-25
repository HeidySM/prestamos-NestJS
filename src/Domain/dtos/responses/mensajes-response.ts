export class MensajesResponse {
  data: MensajesData;
}

export class MensajesData {
  type: string;
  attributes: MensajesAttributes;
}

export class MensajesAttributes {
  mensaje: string;
}