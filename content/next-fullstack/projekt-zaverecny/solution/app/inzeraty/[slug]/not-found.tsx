import Link from 'next/link';

export default function InzeratNenalezen() {
  return (
    <>
      <h1>Takový inzerát tu není</h1>
      <p>Nejspíš už se prodal a někdo ho stáhl.</p>
      <p>
        <Link href="/inzeraty">Zpátky na seznam</Link>
      </p>
    </>
  );
}
