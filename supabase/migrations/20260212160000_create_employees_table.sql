DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Get the tenant ID for 'imago'
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'imago' LIMIT 1;

    -- Create employees table if not exists
    CREATE TABLE IF NOT EXISTS public.employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        role TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        tenant_id UUID REFERENCES public.tenants(id)
    );

    -- Add unique constraint on name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employees_name_key') THEN
        ALTER TABLE public.employees ADD CONSTRAINT employees_name_key UNIQUE (name);
    END IF;

    -- Enable RLS
    ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

    -- Create Policies
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employees;
    CREATE POLICY "Enable read access for authenticated users" ON public.employees
        FOR SELECT
        TO authenticated
        USING (true);

    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.employees;
    CREATE POLICY "Enable all access for authenticated users" ON public.employees
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);

    -- Trigger for updated_at
    DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
    CREATE TRIGGER update_employees_updated_at
        BEFORE UPDATE ON public.employees
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();

    -- Insert seed data
    IF v_tenant_id IS NOT NULL THEN
        INSERT INTO public.employees (name, tenant_id, active)
        SELECT n, v_tenant_id, true
        FROM unnest(ARRAY[
            'ABRAHÃO JÚNIOR DE ALMEIDA',
            'ALICE MATIAS PEREIRA DA SILVA',
            'ALINE JULIANA PEREIRA DA SILVA',
            'ALINE PATRICIA MARTINS DA SILVA CASTRO',
            'ALISSON RAFAEL NUNES DA SILVA',
            'ALYCE VITORIA CAMPOS VIDAL',
            'AMANDA DE ARAUJO FLORENTINO',
            'ANA CAROLINA LISBOA BEZERRA',
            'ANA CAROLINA SILVA DE SOUZA',
            'ANA CLAUDIA FERNANDES PERES',
            'ANA CRISTINA JORDAO DE AQUINO',
            'ANA PAULA GOMES BARBOSA',
            'ANDREZA PEREIRA DA SILVA',
            'ANTONIO PEDRO DOS SANTOS DE ARAUJO',
            'BEATRIZ ARAUJO HONORIO',
            'BRUNA MORAIS DE BRITO',
            'BRUNO DOS SANTOS SOARES',
            'CAIO HENRIQUE RAMOS MEDEIROS',
            'CAIO LUCAS DE MEDEIROS GUIMARAES',
            'CAMILA PAULINO DE SOUSA SILVA',
            'CLAUDIA COSTA DO NASCIMENTO',
            'CRISTIANO FLORIANO DE OLIVEIRA',
            'DANIELA DE LIMA FERREIRA',
            'DANIELA NATALIA DA SILVA SOBRAL',
            'DAYANE AGUIAR DA SILVA',
            'DIEGO NILSON CAVALCANTE ALMEIDA',
            'ELLEN BEATRIZ SAMPAIO SILVA',
            'ELLEN MENDES DE FREITAS',
            'EMANUELA VIEIRA RAPOSO DE ARAUJO',
            'ERICA MAYARA DE SOUSA CORDEIRO',
            'ERILA KLECIA FERREIRA DA SILVA',
            'GABRIELA DE MELO ALVES',
            'GESSICA DE SOUZA COSTA MAIA GADELHA',
            'GISELI FERREIRA DIAS',
            'GISLAYNE ROCHA RODRIGUES',
            'HILMA VIRGINIA VASCONCELOS LOUREIRO',
            'IAN DO NASCIMENTO BARBOSA',
            'IANE SOUZA QUEIROZ DE PONTES',
            'ITAINARA PINTO DA SILVA',
            'IVSON GUSTAVO GOMES DE OLIVEIRA',
            'IZABELA LORENA RIBEIRO DA SILVA',
            'JOANITA DE ALCANTARA BESERRA ALVES',
            'JOAO PAULO AGUIAR DE BRITTO LYRA',
            'JOAO VICTOR FERNANDES DE SOUZA',
            'JOSE MOTA DA SILVA',
            'JOSÉ FELIPE LISBÔA FRANÇA',
            'JUAN PABLO FARIAS LIMA',
            'JULIA SOUSA SILVA',
            'KALYNE PEREIRA DOS SANTOS',
            'KELVESON WENDELL TRAJANO RIBEIRO',
            'KESSIA KAROLINE FLORO LEMOS',
            'KLEMONICA SILVA COSTA',
            'LARA OHARRANA CELESTINO SILVA',
            'LARYSSA RAVENA NOBREGA BARROS XAVIER',
            'LAURA DOS SANTOS FERREIRA',
            'LIDIANE DA SILVA PATRICIO',
            'LIDIANE MARIA CAVALCANTI',
            'LILLIAN VIANA DA COSTA',
            'LORRAYNE MENDES VELOZO',
            'LUAN DE FARIAS QUEIROZ',
            'LUANA SOUZA DOS SANTOS',
            'LUIS FELIPE MEDEIROS HALULE',
            'LUIZ GABRIEL TAVARES',
            'MAERCIA DA SILVA AZEVEDO LIMA',
            'MAIRA ANDRADE DA ROCHA',
            'MARIA APARECIDA DOS SANTOS',
            'MARIA BEATRIZ SILVA DE OLIVEIRA',
            'MARIA DAS GRACAS DOS SANTOS LOURENCO',
            'MARIA LUCIA DE AGUIAR',
            'MARIA SAMYRA AGRICIO ATAIDE SOUZA',
            'MARIANA IZABEL DA SILVA FRANCELINO',
            'MARY ROSE VIEIRA CHAVES',
            'MELISSA ALMEIDA MELO',
            'MOISES COSTA MACHADO',
            'MONALY TAIZZE DE SOUZA',
            'MONICA SOLANGE BARRETO DE MELO',
            'NATHAN OLIVEIRA DE CARVALHO',
            'NAYALA GOMES DE LACERDA',
            'NHAYARA LARISSA DE ALMEIDA MARINHO',
            'PALOMA PRICILA MARQUES DOS SANTOS',
            'PAMELA HELOISY LUCENA DE SOUZA',
            'PAULA FABRICIA DO NASCIMENTO ARAUJO',
            'PEDRO HENRIQUE GARCIA LIRA',
            'POLIANA GALBA CLAUDINO SILVA',
            'PRISCILA ALMEIDA',
            'PRISCILA NUNES MOREIRA MARCELINO',
            'RAFAEL GUIMARAES COSTA',
            'RAFAEL PEREIRA DA COSTA SILVA',
            'RANIELE RODRIGUES DA COSTA',
            'RAYSSA MORAES MARTINS',
            'RENE ARAUJO PEREIRA MENDOÇA DE LUCENA',
            'RODRIGO HENRIQUE ALVES DE LIMA',
            'SAMARA RODRIGUES FERREIRA',
            'SARAH MARIA CARVALHO LOPES',
            'SERGIO PEREIRA SOBREIRA',
            'SINDIA MARA PEREIRA DA SILVA RODRIGUES',
            'STEFANNY BESERRA NUNES',
            'STELLA SOUTO SILVA',
            'THAIS LORENA DA SILVA SANTOS',
            'THALIA PEREIRA RODRIGUES',
            'THALITA RANIELLY MORAES RAMOS',
            'URIEL BARBOSA QUEIROGA SOUSA',
            'VANESSA DA SILVA OLIVEIRA',
            'VANESSA RIBEIRO DA FRANCA',
            'VINICIUS YEGO MEDEIROS MACEDO',
            'YASMIN MARIA DE FARIAS DAMASIO'
        ]) as n
        ON CONFLICT (name) DO NOTHING;
    END IF;
END $$;
