// Co verify u jednotlivých typů modulů kontroluje (kontrakt kap. 10, body 2–5).
//
// planModule(module) vrátí seznam běhů runneru (RunRequest) a funkci, která z jejich
// výsledků sestaví chyby a varování. Samotné spouštění řeší verify.js.
import { plural } from './czech.js';

export const MIN_QUIZ_QUESTIONS = 5;

const TYPE_NAMES = { lesson: 'lekce', workshop: 'workshop', lab: 'lab', quiz: 'kvíz', project: 'projekt' };

export function typeName(type) {
  return TYPE_NAMES[type] ?? type;
}

const toRunFiles = (files) => files.map((file) => ({ name: file.name, content: file.content }));
const normalizeWhitespace = (text) => String(text).replace(/\s+/g, ' ').trim();

function shorten(text, max = 60) {
  const flat = normalizeWhitespace(text).replace(/[`*_]/g, '');
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

function describeFailure(error) {
  return shorten(error ?? 'neznámá chyba', 240);
}

/**
 * @returns {{ jobs: object[], evaluate(results: object[]): { errors: string[], warnings: string[], notes: string[] } }}
 */
export function planModule(module) {
  const jobs = [];
  const checks = []; // (results, report) => void

  const addJob = (request) => jobs.push(request) - 1;

  /** Krok workshopu, lab i projekt: seed musí aspoň jednou selhat, řešení projít bez chyb. */
  function planStep(step, label) {
    const runtime = step.runtime;
    // Stejný limit jako v aplikaci: krok ho smí zvýšit ve frontmatteru (`timeoutMs`).
    const timeout = typeof step.meta?.timeoutMs === 'number' ? { timeoutMs: step.meta.timeoutMs } : {};
    const seedJob = addJob({ runtime, files: toRunFiles(step.seed), hints: step.hints, ...timeout });
    const solutionJob = addJob({ runtime, files: toRunFiles(step.solution), hints: step.hints, ...timeout });

    checks.push((results, report) => {
      const seed = results[seedJob];
      const solution = results[solutionJob];
      const runnerError = seed.runnerError ?? solution.runnerError;
      if (runnerError) return report.error(`${label}: ${runnerError}`);

      if (seed.results.every((result) => result.pass)) {
        report.error(`${label}: výchozí kód (seed) projde všemi testy — aspoň jeden test musí selhat`);
      }
      for (const result of solution.results) {
        // Přeskočené testy (stránka se zasekla při načítání) nahlásí už test, který selhal první.
        if (result.pass || result.skipped) continue;
        const hint = shorten(step.hints[result.index]?.text ?? '');
        report.error(`${label}: řešení neprojde testem ${result.index + 1} („${hint}"): ${describeFailure(result.error)}`);
      }
      if (solution.errors.length) {
        report.error(`${label}: řešení hlásí chyby: ${solution.errors.map((e) => shorten(e, 160)).join(' | ')}`);
      }
    });
  }

  switch (module.type) {
    case 'workshop': {
      module.steps.forEach((step, index) => {
        const label = `krok ${step.id.split('/').pop()}`;
        planStep(step, label);
        if (index > 0) {
          const previous = module.steps[index - 1];
          // Soubor, který v kroku N nově přibyl (např. index.html při přechodu z js na dom),
          // návaznost neporušuje — uživatelův dosavadní kód zůstává stejný.
          const differences = compareFiles(previous.solution, step.seed, { allowNewFiles: true });
          if (differences.length) {
            checks.push((_, report) => report.warning(
              `${label}: seed se liší od řešení kroku ${previous.id.split('/').pop()} (${differences.join(', ')})`,
            ));
          }
        }
      });
      checks.push((_, report) => report.note(plural(module.steps.length, 'krok', 'kroky', 'kroků')));
      break;
    }
    case 'lab':
      if (module.lab.solution.length === 0) {
        // Lab smí seed i řešení vynechat, verify ale bez řešení nemá co ověřit.
        checks.push((_, report) => report.error('lab nemá sekci --solution--, bez řešení ho nejde ověřit'));
      } else {
        planStep(module.lab, 'lab');
      }
      break;
    case 'project':
      planStep(module.project, 'projekt');
      break;
    case 'lesson': {
      const liveBlocks = module.lesson.blocks.filter((block) => block.kind === 'live');
      liveBlocks.forEach((block, index) => {
        const job = addJob({ runtime: block.runtime, files: toRunFiles(block.files), hints: [] });
        checks.push((results, report) => {
          const result = results[job];
          if (result.runnerError) return report.error(`živá ukázka ${index + 1}: ${result.runnerError}`);
          if (result.errors.length) {
            report.error(`živá ukázka ${index + 1} hlásí chyby: ${result.errors.map((e) => shorten(e, 160)).join(' | ')}`);
          }
        });
      });
      const questions = module.lesson.questions.length;
      checks.push((_, report) => report.note(`${plural(liveBlocks.length, 'živá ukázka', 'živé ukázky', 'živých ukázek')}, ${plural(questions, 'otázka', 'otázky', 'otázek')}`));
      break;
    }
    case 'quiz': {
      const count = module.quiz.questions.length;
      checks.push((_, report) => {
        report.note(plural(count, 'otázka', 'otázky', 'otázek'));
        if (count < MIN_QUIZ_QUESTIONS) report.warning(`kvíz má jen ${plural(count, 'otázku', 'otázky', 'otázek')} (doporučeno aspoň ${MIN_QUIZ_QUESTIONS})`);
      });
      break;
    }
  }

  return {
    jobs,
    evaluate(results) {
      const outcome = { errors: [], warnings: [], notes: [] };
      const report = {
        error: (text) => outcome.errors.push(text),
        warning: (text) => outcome.warnings.push(text),
        note: (text) => outcome.notes.push(text),
      };
      for (const check of checks) check(results, report);
      return outcome;
    },
  };
}

/**
 * Jména souborů, ve kterých se dvě sady liší (po sloučení bílých znaků).
 * allowNewFiles: soubory, které jsou jen v `actualFiles`, se za rozdíl nepočítají.
 */
export function compareFiles(expectedFiles, actualFiles, { allowNewFiles = false } = {}) {
  const expected = new Map(expectedFiles.map((file) => [file.name, normalizeWhitespace(file.content)]));
  const actual = new Map(actualFiles.map((file) => [file.name, normalizeWhitespace(file.content)]));
  const names = [...new Set([...expected.keys(), ...actual.keys()])];
  return names
    .filter((name) => !(allowNewFiles && !expected.has(name)))
    .filter((name) => expected.get(name) !== actual.get(name));
}
