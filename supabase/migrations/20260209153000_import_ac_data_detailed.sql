-- Migration to import AC maintenance data from spreadsheet
-- Generated from user provided data

DO $$
DECLARE
    v_tenant_id uuid;
BEGIN
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'imago' LIMIT 1;

    -- Helper to insert data
    INSERT INTO public.inspections_ac (
        tenant_id,
        criado_em,
        numero_serie,
        modelo,
        localizacao,
        origem,
        atividades,
        observacoes,
        fotos_urls
    ) VALUES
    -- 1. Samsung 3 - Térreo recepção
    (
        v_tenant_id, 
        '2026-01-06 22:42:19-03', 
        'OHWYPXAN70053Z', 
        'Samsung 3', 
        'Térreo recepção prédio principal', 
        'terceirizado', 
        '["Limpeza profunda", "Manutenção preventiva"]'::jsonb, 
        'Técnico: Daniel Alves - Arclimtec. Descrição: Foi realizada manutenção preventiva no equipamento, retirado e desmontado, limpeza de toda parte evaporadora.', 
        ARRAY['https://drive.google.com/open?id=1iP-o9B-cwdOZQoNejwNZpdYskxcjS4sT', 'https://drive.google.com/open?id=1cdCgnHFpTB_P_zWsgsuIMkSELUiwz67T']
    ),
    -- 2. Samsung 1 - Térreo recepção
    (
        v_tenant_id,
        '2026-01-06 22:55:33-03',
        '0HWYPΧΑΝ700123T',
        'Samsung 1',
        'Térreo recepção prédio principal',
        'terceirizado',
        '["Limpeza profunda", "Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Realizado manutenção preventiva no equipamento. Retirado o equipamento e realizado a limpeza de toda evaporadora.',
        ARRAY['https://drive.google.com/open?id=1sE0WXAJBsZ3P3JAJ1n2kVFvZ0rX7hcOA', 'https://drive.google.com/open?id=1GlDYRrK8EGxSl2Vljvnfcd1BggiqBtNj']
    ),
    -- 3. Samsung 2 - Térreo recepção
    (
        v_tenant_id,
        '2026-01-06 22:57:10-03',
        '0HWYPΧΑΝ700301B',
        'Samsung 2',
        'Térreo recepção prédio principal',
        'terceirizado',
        '["Limpeza profunda", "Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Realizado manutenção preventiva no equipamento. Retirado o equipamento e realizado a limpeza de toda evaporadora.',
        ARRAY['https://drive.google.com/open?id=1S9kXzTYQILcpaW6w3a2aPQTLzaQK4thH', 'https://drive.google.com/open?id=1pWqcbwIB-mGHbJxApZ7yzDUJBQwuf7RR']
    ),
    -- 4. LG - Posto de enfermagem (Final 272)
    (
        v_tenant_id,
        '2026-01-08 23:08:14-03',
        '112AZAL3S272',
        'LG',
        'Posto de enfermagem perto da Tomografia Térreo',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Foi realizada manutenção preventiva no equipamento. Realizado limpeza e higienização de toda evaporadora. Também foi equalizado fluido refrigerante que estava baixo. Obs: Adição de fluido refrigerante.',
        ARRAY['https://drive.google.com/open?id=1iZLGQAObldLYdFByxKZZ6bgvlpo9l-Kq', 'https://drive.google.com/open?id=1rhHlCy6-Sv015KB_k7ceLd7L5N4Yay18']
    ),
    -- 5. LG - Enfermaria (Final 342)
    (
        v_tenant_id,
        '2026-01-08 23:11:43-03',
        '011AZRD4X342',
        'LG',
        'Enfermaria perto da ressonância magnética',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Foi realizada manutenção preventiva no equipamento. Realizado limpeza e higienização de toda evaporadora. Obs: Sem troca ou pendências.',
        ARRAY['https://drive.google.com/open?id=1v8ZadZDBFFUZc93QtmaoRlasjITgp8_g', 'https://drive.google.com/open?id=1NNsfGFvThg3R5GUMIingk8ZCv1BhM015']
    ),
    -- 6. Samsung - Sala 5 Raio-X
    (
        v_tenant_id,
        '2026-01-08 23:32:14-03',
        '02S6PXCT300230D',
        'Samsung',
        'Sala 5 Raio-X, prédio principal',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Realizada manutenção preventiva no equipamento. Realizado limpeza e higienização de toda evaporadora. Obs: Sem pendências ou trocas.',
        ARRAY['https://drive.google.com/open?id=1q_E-BjCF7ppXVFCPZFByQO0_4Ij0SIkG', 'https://drive.google.com/open?id=1XD2W7HftEZLKsSg8XoRWJyvnIxhsmDaA']
    ),
    -- 7. Samsung - Sala 5 CR Raio-X
    (
        v_tenant_id,
        '2026-01-09 20:15:46-03',
        '02S6PXCT300230D',
        'Samsung',
        'Sala 5 CR Raio-X, prédio principal',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Foi realizado manutenção preventiva no equipamento. Realizado limpeza e higienização de toda evaporadora. Obs: Sem observações ou pendências.',
        ARRAY['https://drive.google.com/open?id=1SY6rEjPxszXHmUt0_agDP1Z44qzmn8q8']
    ),
    -- 8. Elgin 2 - Tomografia
    (
        v_tenant_id,
        '2026-01-09 20:18:45-03',
        'Fictício 1242',
        'Elgin 2',
        'Tomografia prédio principal',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Foi realizada manutenção preventiva no equipamento. Realizado limpeza e higienização de toda evaporadora. Obs: Sem observações ou pendências.',
        ARRAY['https://drive.google.com/open?id=17I2_GYQ_1AjSs5K9AGwTIP1-BikeOQb3', 'https://drive.google.com/open?id=1WN69eXKAuagfCUNFV8b4cNdCT73SsP0H']
    ),
    -- 9. LG - Sala de espera Raio-x (Final 306)
    (
        v_tenant_id,
        '2026-01-12 23:02:49-03',
        '108AZDBBW306',
        'LG',
        'Sala de espera Raio-x',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Foi realizada manutenção preventiva no equipamento. Feito limpeza e higienização em toda evaporadora. Obs: Sem observações ou pendências.',
        ARRAY['https://drive.google.com/open?id=1QlYEw6aza_zAkkfohsDGucYxDQAkLiCM', 'https://drive.google.com/open?id=12eBI1veyVlumdUSzdtMKA40MW49Uh0Ze']
    ),
    -- 10. Samsung - Sala 3 mamografia 
    (
        v_tenant_id,
        '2026-01-12 23:06:19-03',
        '02S1PXCT302088N',
        'Samsung',
        'Sala 3 mamografia',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Foi realizado manutenção preventiva no equipamento. Realizado limpeza e higienização na evaporadora. Obs: Sem observações ou pendências.',
        ARRAY['https://drive.google.com/open?id=1gM7bCNOYTqQUEPhqZ98QrVITH24nJ4yj']
    ),
    -- 11. Samsung - Sala de desenvolvimento
    (
        v_tenant_id,
        '2026-01-12 23:10:04-03',
        '032WPXCXC13239D',
        'Samsung',
        'Sala de desenvolvimento e automações',
        'terceirizado',
        '["Manutenção corretiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Foi equalizado fluido refrigerante do equipamento, que se encontrava em baixa pressão. Obs: Uso de fluido refrigerante R32',
        ARRAY[]::text[]
    ),
    -- 12. Hitachi - Sala de comando tomografia
    (
        v_tenant_id,
        '2026-01-13 22:39:25-03',
        'Fictício 1240',
        'Hitachi',
        'Sala de comando tomografia prédio principal',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Foi realizado a manutenção preventiva do equipamento. Realizado limpeza e higienização de toda evaporadora.',
        ARRAY[]::text[]
    ),
    -- 13. Samsung 3 (Repetido com foto extra?) - Mantendo como registro distinto se timestamp igual mas pode ser re-entry
    -- Obs: timestamp igual ao item 1. Mas descrição levemente diferente "Foi realizado" vs "Foi realizada".
    -- Assumindo que são registros duplicados de controle, vou inserir para manter histórico completo conforme pedido.
    (
        v_tenant_id,
        '2026-01-06 22:42:19-03',
        'OHWYPXAN70053Z',
        'Samsung 3',
        'Térreo recepção prédio principal',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Foi realizado manutenção preventiva no equipamento. Realizado limpeza e higienização de toda evaporadora.',
        ARRAY['https://drive.google.com/open?id=1iP-o9B-cwdOZQoNejwNZpdYskxcjS4sT', 'https://drive.google.com/open?id=1cdCgnHFpTB_P_zWsgsuIMkSELUiwz67T']
    ),
    -- 14. Samsung 1 (Repetido?)
    (
        v_tenant_id,
        '2026-01-06 22:55:33-03',
        '0HWYPΧΑΝ700123T',
        'Samsung 1',
        'Térreo recepção prédio principal',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Foi realizado manutenção preventiva no equipamento. Foi realizado limpeza e higienização em toda evaporadora.',
        ARRAY['https://drive.google.com/open?id=1sE0WXAJBsZ3P3JAJ1n2kVFvZ0rX7hcOA', 'https://drive.google.com/open?id=1GlDYRrK8EGxSl2Vljvnfcd1BggiqBtNj']
    ),
     -- 15. Samsung 2 (Repetido?)
    (
        v_tenant_id,
        '2026-01-06 22:57:10-03',
        '0HWYPΧΑΝ700301B',
        'Samsung 2',
        'Térreo recepção prédio principal',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Realizado manutenção preventiva no equipamento. Realizado limpeza e higienização de toda evaporadora.',
        ARRAY['https://drive.google.com/open?id=1S9kXzTYQILcpaW6w3a2aPQTLzaQK4thH', 'https://drive.google.com/open?id=1pWqcbwIB-mGHbJxApZ7yzDUJBQwuf7RR']
    ),
    -- 16. LG (Final 273 - Distinto)
    (
        v_tenant_id,
        '2026-01-08 23:08:14-03',
        '112AZAL3S273',
        'LG',
        'Posto de enfermagem perto da Tomografia Térreo',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Realizado manutenção preventiva no equipamento. Realizado limpeza e higienização de toda evaporadora.',
        ARRAY['https://drive.google.com/open?id=1iZLGQAObldLYdFByxKZZ6bgvlpo9l-Kq', 'https://drive.google.com/open?id=1rhHlCy6-Sv015KB_k7ceLd7L5N4Yay19']
    ),
    -- 17. LG (Final 343 - Distinto)
    (
        v_tenant_id,
        '2026-01-08 23:11:43-03',
        '011AZRD4X343',
        'LG',
        'Enfermaria perto da ressonância magnética',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Realizado manutenção preventiva no equipamento. Realizado limpeza e higienização de toda evaporadora.',
        ARRAY['https://drive.google.com/open?id=1v8ZadZDBFFUZc93QtmaoRlasjITgp8_g', 'https://drive.google.com/open?id=1NNsfGFvThg3R5GUMIingk8ZCv1BhM016']
    ),
    -- 18. Samsung (Igual ao 6? Descrição levemente diferente)
    (
        v_tenant_id,
        '2026-01-08 23:32:14-03',
        '02S6PXCT300230D',
        'Samsung',
        'Sala 5 Raio-X, prédio principal',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Realizado manutenção preventiva no equipamento. Realizado limpeza e higienização em toda evaporadora.',
        ARRAY['https://drive.google.com/open?id=1q_E-BjCF7ppXVFCPZFByQO0_4Ij0SIkG', 'https://drive.google.com/open?id=1XD2W7HftEZLKsSg8XoRWJyvnIxhsmDaA']
    ),
    -- 19. Samsung (Igual ao 7? Foto final 9, anterior era 8)
    (
        v_tenant_id,
        '2026-01-09 20:15:46-03',
        '02S6PXCT300230D',
        'Samsung',
        'Sala 5 CR Raio-X, prédio principal',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Realizado manutenção preventiva no equipamento. Realizado limpeza e higienização de toda evaporadora.',
        ARRAY['https://drive.google.com/open?id=1SY6rEjPxszXHmUt0_agDP1Z44qzmn8q9']
    ),
    -- 20. Elgin 3 (Distinto do 8)
    (
        v_tenant_id,
        '2026-01-09 20:18:45-03',
        'Fictício 1243',
        'Elgin 3',
        'Tomografia prédio principal',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Realizado manutenção preventiva no equipamento. Realizado limpeza e higienização de toda evaporadora. Realizado equalização do gás refrigerante que se encontrava baixo. Obs: Adição de gás refrigerante R410A',
        ARRAY['https://drive.google.com/open?id=17I2_GYQ_1AjSs5K9AGwTIP1-BikeOQb4', 'https://drive.google.com/open?id=1WN69eXKAuagfCUNFV8b4cNdCT73SsP0H']
    ),
    -- 21. LG (Final 307 - Distinto)
    (
        v_tenant_id,
        '2026-01-12 23:02:49-03',
        '108AZDBBW307',
        'LG',
        'Sala de espera Raio-x',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Realizado manutenção preventiva do equipamento. Realizado limpeza e higienização de toda evaporadora.',
        ARRAY['https://drive.google.com/open?id=1QlYEw6aza_zAkkfohsDGucYxDQAkLiCM', 'https://drive.google.com/open?id=12eBI1veyVlumdUSzdtMKA40MW49Uh0Ze']
    ),
    -- 22. Samsung (Igual ao 10? Descrição levemente diferente)
    (
        v_tenant_id,
        '2026-01-12 23:06:19-03',
        '02S1PXCT302088N',
        'Samsung',
        'Sala 3 mamografia',
        'terceirizado',
        '["Manutenção preventiva"]'::jsonb,
        'Técnico: Daniel Alves - Arclimtec. Descrição: Realizado manutenção preventiva do equipamento. Realizado limpeza e higienização de toda evaporadora.',
        ARRAY['https://drive.google.com/open?id=1gM7bCNOYTqQUEPhqZ98QrVITH24nJ4yj']
    );

END $$;
