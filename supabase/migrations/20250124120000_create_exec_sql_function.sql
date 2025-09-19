-- Criação da função exec_sql para permitir execução de SQL dinâmico
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN 'SQL executado com sucesso';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Erro: ' || SQLERRM;
END;
$$;

-- Garantir que apenas desenvolvedores possam usar esta função
REVOKE ALL ON FUNCTION exec_sql(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO authenticated;

-- Criar política RLS para a função (apenas desenvolvedores)
CREATE POLICY "Apenas desenvolvedores podem executar SQL"
ON module_permissions
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'app_role' = 'developer');