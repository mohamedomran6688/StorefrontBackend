interface objects_database {
  [key: string]: number | string | null | boolean | undefined;
}

type tokenType = {
  user: { id: number };
  iat: number;
};

export { objects_database, tokenType };
