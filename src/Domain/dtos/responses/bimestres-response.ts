export class BimestresResponse {
  data: BimestresData;
}

export class BimestresData {
  type: string;
  attributes: BimestresAttributes;
}

export class BimestresAttributes {
  bimestres: Array<string>;
}