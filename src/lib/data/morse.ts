export const MORSE_CODE: Record<string, string> = {
	'A': '.-',    'B': '-...',   'C': '-.-.',
	'D': '-..',   'E': '.',      'F': '..-.',
	'G': '--.',   'H': '....',   'I': '..',
	'J': '.---',  'K': '-.-',    'L': '.-..',
	'M': '--',    'N': '-.',     'O': '---',
	'P': '.--.',  'Q': '--.-',   'R': '.-.',
	'S': '...',   'T': '-',      'U': '..-',
	'V': '...-',  'W': '.--',    'X': '-..-',
	'Y': '-.--',  'Z': '--..',
	'0': '-----', '1': '.----',  '2': '..---',
	'3': '...--', '4': '....-',  '5': '.....',
	'6': '-....', '7': '--...',  '8': '---..',
	'9': '----.'
};

export const LEARNING_ORDER: string[][] = [
	['E', 'T'],
	['A', 'I', 'M', 'N'],
	['D', 'G', 'K', 'O', 'R', 'U'],
	['B', 'C', 'F', 'H', 'L', 'P', 'S', 'V'],
	['J', 'Q', 'W', 'X', 'Y', 'Z'],
	['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
];

export interface AchievementDef {
	nombre: string;
	desc: string;
	icono: string;
}

export const ACHIEVEMENTS: Record<string, AchievementDef> = {
	primer_nivel:    { nombre: 'Primeros Pasos',     desc: 'Completa el Nivel 1',               icono: '🌟' },
	nivel_2:         { nombre: 'En Progreso',         desc: 'Completa el Nivel 2',               icono: '📈' },
	nivel_3:         { nombre: 'Comunicador',         desc: 'Completa el Nivel 3',               icono: '🗣️' },
	nivel_4:         { nombre: 'Experto',             desc: 'Completa el Nivel 4',               icono: '🎯' },
	nivel_5:         { nombre: 'Casi un Maestro',     desc: 'Completa el Nivel 5',               icono: '🔝' },
	todos_niveles:   { nombre: 'Gran Maestro Morse',  desc: 'Completa todos los niveles',        icono: '🏆' },
	racha_5:         { nombre: 'Racha',               desc: '5 aciertos seguidos',               icono: '🔥' },
	racha_10:        { nombre: 'Imparable',           desc: '10 aciertos seguidos',              icono: '⚡' },
	nivel_perfecto:  { nombre: 'Perfecto',            desc: 'Completa un nivel sin errores',     icono: '💎' },
	primer_acierto:  { nombre: 'Primer Intento',      desc: 'Acierta tu primera letra',          icono: '🎯' },
};

export function formatMorse(code: string): string {
	return code.split('').map(s => s === '.' ? '·' : '—').join(' ');
}
