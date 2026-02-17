-- Create ac_units table
CREATE TABLE IF NOT EXISTS public.ac_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_qrcode INTEGER UNIQUE, -- Using id_qrcode as the unique identifier instead
    numero_serie TEXT,
    modelo TEXT,
    localizacao TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ac_units ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public select" ON public.ac_units FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access" ON public.ac_units FOR ALL USING (auth.role() = 'authenticated');

-- Insert Data
INSERT INTO public.ac_units (id_qrcode, numero_serie, modelo, localizacao)
VALUES
(8, '102AZPUBY752', 'LG 1', 'Recepção Radiografia'),
(9, 'Fictício 1234', 'LG 2', 'Recepção Radiografia'),
(10, 'Fictício 1235', 'LG', 'Sala de espera Radiografia'),
(11, '02W5PXCW700392Y', 'Samsung', 'Radiografia'),
(12, '209AZBZ87605', 'LG', 'Radiografia'),
(13, '02W5PXCW500703E', 'Samsung', 'Recepção do Anexo'),
(14, 'Fictício 1236', 'Hitachi', 'Sala de espera procedimentos'),
(15, '101AZKA5W157', 'LG 1', 'Sala de espera procedimentos'),
(16, '101AZFM5W187', 'LG 2', 'Sala de espera procedimentos'),
(17, '109AZRD3A774', 'LG', 'Sala de procedimentos 2'),
(18, '009AZYE2S722', 'LG', 'Sala de procedimentos 1'),
(19, 'Fictício 1237', 'Hitachi', 'Sala de espera Eletrocardiograma'),
(20, '032WPXCXC13230R', 'Samsung', 'Sala de eletroencefalograma'),
(21, '911AZERC9020', 'LG', 'Sala de Eletrocardiograma com esteira'),
(22, '008AZMG50291', 'LG', 'Sala de ultrassonografia'),
(23, '009AZHY2E737', 'LG 1', 'Sala em reforma'),
(62, '010AZYEDU162', 'LG 2', 'Sala em reforma'),
(25, '0HWYPΧΑΝ700123T', 'Samsung 1', 'Térreo recepção prédio principal'),
(26, '0HWYPΧΑΝ700301B', 'Samsung 2', 'Térreo recepção prédio principal'),
(27, 'OHWYPXAN70053Z', 'Samsung 3', 'Térreo recepção prédio principal'),
(28, '02S6PXCT300230D', 'Samsung', 'Sala 5 Raio-X, prédio principal'),
(29, '02S6PXCT300230D', 'Samsung', 'Sala 5 CR Raio-X, prédio principal'),
(30, '112AZAL3S272', 'LG', 'Posto de enfermagem perto da Tomografia Térreo'),
(31, '001AZCO9N811', 'LG', 'Sala de espera Tomografia sala 07'),
(32, '101AZPU5W144', 'LG', 'Sala de espera Ressonância magnética'),
(33, '108AZDBBW306', 'LG', 'Sala de espera Raio-x'),
(34, 'Fictício 1238', 'Samsung 1', 'Corredor de ultrassom 1º andar prédio principal'),
(36, 'Fictício 1239', 'Elgin', 'Sala 04 Densitometria'),
(37, '011AZRD4X342', 'LG', 'Enfermaria perto da ressonância magnética'),
(38, '82400134', 'Eletrolux', 'Em frente a sala de refrigeração'),
(39, 'Fictício 1240', 'Hitachi', 'Sala de comando tomografia prédio principal'),
(40, 'Fictício 1241', 'Elgin 1', 'Tomografia prédio principal'),
(41, 'Fictício 1242', 'Elgin 2', 'Tomografia prédio principal'),
(42, '82400208', 'Elgin', 'Sala de comando ressonância magnética térreo'),
(43, '82400119', 'Elgin', 'Sala de comando ressonância magnética térreo'),
(45, '0HWSPXAN900211T', 'Samsung 2', 'Corredor de ultrassom 1º andar prédio principal'),
(46, '02YEPXCW702443R', 'Samsung', 'Sala 06 ultrassonografia prédio principal'),
(47, 'Fictício 1244', 'Samsung', 'Sala 05 ultrassonografia prédio principal'),
(48, '010AZNKDD151', 'LG', 'Sala 04 ultrassonografia prédio principal 1º andar'),
(50, '009AZWS2E753', 'LG', 'Sala 08 ultrassonografia prédio principal 1º andar'),
(51, '008AZVNDM215', 'LG', 'Sala de espera das salas 08 e 09 ultrassom 1º andar'),
(52, '010AZLWGJ432', 'LG', 'Sala 09 ultrassonografia prédio principal 1º andar'),
(49, 'Fictício 1245', 'Samsung', 'Sala 03 ultrassonografia prédio principal 1º andar'),
(53, '009AZXC2E754', 'LG', 'Sala 07 ultrassonografia prédio principal 1º andar'),
(54, '02VXPXCW600649W', 'Samsung', 'Sala 02 ultrassonografia prédio principal 1º andar'),
(55, '0JCMPXAR700916V', 'Samsung', 'Recepção ultrassonografia 1º andar prédio principal'),
(56, 'Fictício 1246', 'Samsung', 'Sala de entregas e correções 1º andar (exames)'),
(57, 'Fictício 1247', 'Samsung', 'Sala de entregas e correções 1º andar (exames)'),
(59, '02S1PXCT400916J', 'Samsung', 'Sala Setor financeiro prédio principal 1º andar'),
(60, 'Fictício 1248', 'Samsung', 'Recepção ultrassonografia 1º andar brinquedoteca'),
(61, 'Fictício 1249', 'Hitachi', 'Prédio principal sala de descanso dos funcionários'),
(4, '032WPXCXC13239D', 'Samsung', 'Sala de desenvolvimento e automações'),
(2, '032WPXCXC13306L', 'Samsung', 'Sala TI'),
(1, '032WPXCXC13270P', 'Samsung', 'Sala diretoria'),
(7, '033BPXCY200178N', 'Samsung', 'Sala telefonia'),
(6, '032WPXCXC13289N', 'Samsung', 'Sala RH'),
(3, '032WPXCXC13266B', 'Samsung', 'Sala faturamento'),
(5, '033BPXCY200124K', 'Samsung', 'Sala de laudo'),
(24, '2018B13344372', 'Springer', 'Sala de espera salas 1 a 4'),
(58, '02S1PXCT804047T', 'Samsung', 'Sala (coordenação) 1º andar prédio principal'),
(44, 'Fictício 1243', 'Samsung', 'Sala 01 ultrassonografia prédio principal, 1º andar'),
(63, '0JCDPXAR708955Y', 'SAMSUNG', 'sala do servidor primeiro andar'),
(64, '1234679', 'Samsung', 'Ar-condicionado 1 sala 3 mamografia'),
(35, '02S1PXCT302088N', 'Samsung', 'Ar-condicionado 2 sala 3 mamografia'),
(65, '038PPXCYA01990L', 'Samsung', 'Ar-condicionado 1 prédio entregas'),
(66, '038PPXCYA01980A', 'Samsung', 'Ar-condicionado 2 prédio entregas'),
(67, '033SPXCY501064N', 'Samsung', 'Sala de reuniões da Administração')
ON CONFLICT (id_qrcode) DO UPDATE SET
    numero_serie = EXCLUDED.numero_serie,
    modelo = EXCLUDED.modelo,
    localizacao = EXCLUDED.localizacao;
