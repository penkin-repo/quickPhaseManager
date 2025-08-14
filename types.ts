
export interface Phrase {
  id: string;
  title: string;
  text: string;
}

export interface Group {
  id: string;
  name: string;
  phrases: Phrase[];
}
