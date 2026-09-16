import { filtrujKavy, vsechnyKavy, type Druh } from '@/lib/kava';

export async function GET(request: Request) {
  const parametry = new URL(request.url).searchParams;
  const dotaz = parametry.get('q') ?? '';
  const druh = (parametry.get('druh') ?? 'vse') as Druh | 'vse';

  return Response.json(filtrujKavy(vsechnyKavy(), { dotaz, druh }));
}
