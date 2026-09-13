// Kontroly napříč kurzem (kontrakt kap. 10.1): osnova a doporučená trasa (S2, S3),
// reference na výklad (S4), pojmy (S5, S6, S9), soubory sekce (S7–S9, M1) a karty (C1–C3).
//
// createCourseChecks(course) vrátí funkce, které verify.js předá kontrolám modulů
// a sekcí. `course` je model z loadCourse (content-scan.js) nad CELÝM obsahem.
import { findSeeLinks, findTermRefs, parseRef, termLookupKey } from '../../shared/refs.js';
import { createOutcome, planCards } from './content-checks.js';
import { plural } from './czech.js';
import { duplicateKeys, findCallouts, markdownLines, moduleMarkdown, moduleRefs, shorten } from './verify-rules.js';

const LEVELS = ['jadro', 'rozsireni'];

export function createCourseChecks(course) {
  // ——— pojmy: vyhledávací klíč → pojmy (kvůli kolizím víc) ———
  const termsByKey = new Map();
  for (const section of course.sections.values()) {
    for (const term of section.pojmy.value ?? []) {
      for (const form of [term.term, ...term.aliases]) {
        const key = termLookupKey(form);
        if (!termsByKey.has(key)) termsByKey.set(key, []);
        const list = termsByKey.get(key);
        if (!list.includes(term)) list.push(term);
      }
    }
  }

  // ——— pořadí sekcí pro S6 (trasa, jinak osnova) a Q4 (části) ———
  const trasa = Array.isArray(course.osnova?.doporucenaTrasa) && course.osnova.doporucenaTrasa.length ? course.osnova.doporucenaTrasa : null;
  const position = (sectionId) => {
    if (trasa) {
      const index = trasa.indexOf(sectionId);
      return index === -1 ? null : index;
    }
    return course.sections.get(sectionId)?.order ?? null;
  };

  /** Chybová zpráva pro neplatnou referenci, nebo null (kap. 2.9). */
  function checkRef(ref) {
    const parsed = parseRef(ref);
    if (!parsed) return `neplatná reference „${ref}"`;
    const section = course.sections.get(parsed.sectionId);
    if (!section) return `reference „${ref}": sekce ${parsed.sectionId} není v osnově`;
    if (!section.available) return `reference „${ref}": sekce ${parsed.sectionId} není na disku`;
    const target = course.modules.get(parsed.moduleId);
    if (!target) return `reference „${ref}": modul ${parsed.moduleId} v sekci není`;
    if (parsed.stepId) {
      if (target.type !== 'workshop') return `reference „${ref}": krok jde uvést jen u workshopu`;
      if (!target.steps.includes(parsed.stepId)) return `reference „${ref}": krok ${parsed.stepId.split('/').pop()} neexistuje`;
    }
    if (parsed.anchor) {
      if (target.type !== 'lesson' || parsed.stepId) return `reference „${ref}": kotva je povolená jen u lekce`;
      // Rozbitou lekci nahlásí její vlastní chyba, kotvy pak nejde ověřit.
      if (target.headings && !target.headings.some((heading) => heading.anchor === parsed.anchor)) {
        return `reference „${ref}": lekce nemá nadpis s kotvou #${parsed.anchor}`;
      }
    }
    return null;
  }

  /** S4 nad seznamem { ref, where }. */
  function reportRefs(refs, report) {
    for (const { ref, where } of refs) {
      const problem = checkRef(ref);
      if (problem) report.error('S4', `${where}: ${problem}`);
    }
  }

  /** S5 a S6 nad markdownem: [[pojem]] musí existovat a nesmí předběhnout sekci své lekce. */
  function reportTermUses(texts, sectionId, report) {
    for (const { where, text } of texts) {
      for (const use of findTermRefs(text)) {
        const matches = termsByKey.get(termLookupKey(use.term));
        if (!matches) {
          report.error('S5', `${where}: pojem [[${use.term}]] neexistuje`);
          continue;
        }
        const lessonSection = parseRef(matches[0].lesson)?.sectionId;
        const usedAt = position(sectionId);
        const explainedAt = lessonSection ? position(lessonSection) : null;
        if (usedAt !== null && explainedAt !== null && usedAt < explainedAt) {
          report.warning('S6', `${where}: pojem [[${use.term}]] se vysvětluje až v sekci ${lessonSection}`);
        }
      }
    }
  }

  function reportCallouts(texts, report) {
    for (const { where, text } of texts) {
      for (const callout of findCallouts(text)) {
        if (!callout.known) report.warning('M1', `${where}: neznámý rámeček > [!${callout.type}] (povolené: REMEMBER, PITFALL, TIP, NOTE)`);
      }
    }
  }

  // ——— použití pojmů v celém kurzu (S9: nepoužitý pojem) ———
  const usedTermKeys = new Set();
  const collectUses = (texts) => {
    for (const { text } of texts) for (const use of findTermRefs(text)) usedTermKeys.add(termLookupKey(use.term));
  };
  for (const record of course.modules.values()) if (record.module) collectUses(moduleMarkdown(record.module));
  for (const section of course.sections.values()) collectUses(sectionMarkdown(section));

  return {
    checkRef,

    /** Odkazy a pojmy jednoho modulu (volá planModule). */
    checkModuleLinks(module, report) {
      reportRefs(moduleRefs(module), report);
      reportTermUses(moduleMarkdown(module), module.sectionId, report);
    },

    /** Q4: je `target` dřívější sekce téže části než `sectionId`? */
    earlierSectionInPart(sectionId, target) {
      const part = course.parts.find((p) => p.sectionIds.includes(sectionId));
      return Boolean(part && part.sectionIds.includes(target) && part.sectionIds.indexOf(target) < part.sectionIds.indexOf(sectionId));
    },
    /** Q4 má smysl, jen když v téže části už existuje (je napsaná) nějaká dřívější sekce. */
    sectionHasEarlierInPart(sectionId) {
      const part = course.parts.find((p) => p.sectionIds.includes(sectionId));
      if (!part) return false;
      return part.sectionIds
        .slice(0, part.sectionIds.indexOf(sectionId))
        .some((id) => course.sections.get(id)?.available);
    },

    /**
     * Soubory sekce: karty, pojmy, tahák, výstupy (S1, S4–S9, M1, C1–C3).
     * @returns {{ jobs, evaluate(results): outcome }}
     */
    planSection(sectionId) {
      const section = course.sections.get(sectionId);
      const cards = section.cards.value ?? [];
      const cardPlan = planCards(cards);
      return {
        jobs: cardPlan.jobs,
        evaluate(results) {
          const { outcome, report } = createOutcome();

          // S1: soubory sekce jdou naparsovat.
          if (section.cards.error) report.error('S1', `cards.md: ${section.cards.error}`);
          if (section.pojmy.error) report.error('S1', `pojmy.md: ${section.pojmy.error}`);
          if (section.outcomesError) report.error('S1', `section.json: ${section.outcomesError}`);
          for (const line of markdownLines(section.tahak ?? '')) {
            // Tahák je obyčejný markdown (kap. 2.7): značky obsahu a ::: bloky v něm nejsou.
            if (!line.inCode && !line.fence && /^(?:#{1,4} --[a-z][a-z*-]*--|--[a-z][a-z*-]*--|:::[a-z]*\s*$|:::[a-z]+\s)/.test(line.text.trim())) {
              report.error('S1', `tahak.md:${line.line}: značka „${shorten(line.text, 40)}" do taháku nepatří (jen obyčejný markdown)`);
            }
          }

          cardPlan.evaluate(results, report);

          // S4: reference ze souborů sekce.
          const refs = [
            ...section.outcomes.flatMap((item, index) => item.links.map((ref) => ({ ref, where: `výstup ${index + 1}` }))),
            ...cards.flatMap((card, index) => card.see.map((ref) => ({ ref, where: `karta ${index + 1}: --see--` }))),
            ...(section.pojmy.value ?? []).map((term) => ({ ref: term.lesson, where: `pojem „${term.term}": lekce` })),
            ...sectionMarkdown(section).flatMap(({ where, text }) => findSeeLinks(text).map((link) => ({ ref: link.ref, where: `${where}: odkaz „${link.text}"` }))),
          ];
          reportRefs(refs, report);

          // S5, S6: pojmy v textech sekce, kolize pojmů a aliasů.
          reportTermUses(sectionMarkdown(section), sectionId, report);
          for (const term of section.pojmy.value ?? []) {
            for (const form of [term.term, ...term.aliases]) {
              const others = termsByKey.get(termLookupKey(form)).filter((other) => other !== term);
              for (const other of others) {
                report.error('S5', `pojem „${term.term}" (tvar „${form}") koliduje s pojmem „${other.term}" v sekci ${other.sectionId}`);
              }
            }
          }

          // S7: duplicitní klíče.
          for (const card of duplicateKeys(cards)) report.warning('S7', `cards.md: duplicitní text karty „${shorten(card.text)}" (klíč ${card.key})`);
          for (const item of duplicateKeys(section.outcomes)) report.warning('S7', `section.json: duplicitní výstup „${shorten(item.text)}" (klíč ${item.key})`);

          // M1: rámečky v textech sekce.
          reportCallouts(sectionMarkdown(section), report);

          // S8, S9: soubory sekce a počty.
          if (section.cards.text === null) report.warning('S8', 'sekce nemá cards.md');
          if (section.pojmy.text === null) report.advice('S9', 'sekce nemá pojmy.md');
          if (section.tahak === null) report.advice('S9', 'sekce nemá tahak.md');
          if (!section.outcomes.length && !section.outcomesError) report.advice('S9', 'section.json nemá outcomes („Po sekci umíš")');
          for (const term of section.pojmy.value ?? []) {
            if (![term.term, ...term.aliases].some((form) => usedTermKeys.has(termLookupKey(form)))) {
              report.advice('S9', `pojem „${term.term}" se nikde v kurzu nepoužívá ([[${term.term}]])`);
            }
          }
          if (section.cards.value) {
            if (cards.length < 15 || cards.length > 30) report.advice('S9', `sekce má ${plural(cards.length, 'kartu', 'karty', 'karet')} (doporučeno 15–30)`);
            const free = cards.filter((card) => card.type === 'free').length;
            if (free < 5) report.advice('S9', `karet free je ${free} (doporučeno aspoň 5)`);
            const withoutSee = cards.filter((card) => !card.see.length).length;
            if (withoutSee) report.advice('S9', `${plural(withoutSee, 'karta nemá', 'karty nemají', 'karet nemá')} --see--`);
          }

          const summary = [];
          if (section.cards.value) summary.push(plural(cards.length, 'karta', 'karty', 'karet'));
          if (section.pojmy.value) summary.push(plural(section.pojmy.value.length, 'pojem', 'pojmy', 'pojmů'));
          if (summary.length) report.note(summary.join(', '));
          return outcome;
        },
      };
    },

    /** Osnova a doporučená trasa (S2, S3). */
    checkOsnova() {
      const { outcome, report } = createOutcome();
      const osnova = course.osnova;
      if (!osnova) return outcome;
      const all = [];
      for (const part of osnova.parts) {
        for (const entry of part.sections ?? []) {
          const id = typeof entry === 'string' ? entry : entry?.id;
          if (typeof id !== 'string') {
            report.error('S2', `část ${part.id}: položka sekce bez id`);
            continue;
          }
          all.push(id);
          const section = course.sections.get(id);
          if (typeof entry === 'object') {
            if (entry.uroven !== undefined && !LEVELS.includes(entry.uroven)) report.error('S2', `sekce ${id}: neplatná uroven „${entry.uroven}" (jadro nebo rozsireni)`);
            if (!section?.available && (!entry.title || !entry.summary)) report.error('S2', `plánovaná sekce ${id} potřebuje title a summary`);
          }
        }
      }
      if (osnova.doporucenaTrasa !== undefined) {
        const route = Array.isArray(osnova.doporucenaTrasa) ? osnova.doporucenaTrasa : [];
        if (!Array.isArray(osnova.doporucenaTrasa)) report.error('S2', 'doporucenaTrasa musí být pole slugů');
        const seen = new Set();
        for (const id of route) {
          if (!all.includes(id)) report.error('S2', `doporucenaTrasa: sekce „${id}" není v žádné části`);
          if (seen.has(id)) report.error('S2', `doporucenaTrasa: sekce „${id}" je v trase dvakrát`);
          seen.add(id);
        }
        for (const section of course.sections.values()) {
          if (section.partId !== null && section.uroven === 'jadro' && !seen.has(section.id)) {
            report.warning('S3', `sekce jádra ${section.id} chybí v doporucenaTrasa`);
          }
        }
      }
      return outcome;
    },

    /** S4 nad odkazy `see` ze shared/errors-cs.js. */
    checkErrorPatternRefs(patterns, { sectionIds = null } = {}) {
      const { outcome, report } = createOutcome();
      for (const pattern of patterns) {
        if (!pattern.see) continue;
        if (sectionIds && !sectionIds.includes(parseRef(pattern.see)?.sectionId)) continue;
        const problem = checkRef(pattern.see);
        if (problem) report.error('S4', `vzor ${pattern.id}: ${problem}`);
      }
      return outcome;
    },
  };
}

/** Markdown souborů sekce, který UI vykresluje: úvod, výstupy, tahák, pojmy, karty. */
export function sectionMarkdown(section) {
  const texts = [];
  if (section.json?.intro) texts.push({ where: 'section.json: intro', text: section.json.intro });
  section.outcomes.forEach((item, index) => texts.push({ where: `výstup ${index + 1}`, text: item.text }));
  if (section.tahak) texts.push({ where: 'tahak.md', text: section.tahak });
  for (const term of section.pojmy.value ?? []) texts.push({ where: `pojem „${term.term}"`, text: term.definition });
  (section.cards.value ?? []).forEach((card, index) => {
    const where = `karta ${index + 1}`;
    texts.push({ where, text: card.text });
    if (card.why) texts.push({ where: `${where} (--why--)`, text: card.why });
    if (card.back) texts.push({ where: `${where} (--back--)`, text: card.back });
  });
  return texts;
}
