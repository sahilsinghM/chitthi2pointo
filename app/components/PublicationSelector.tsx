const publications = [
  { id: "pub-1", name: "Chitthi Weekly" },
  { id: "pub-2", name: "Product Dispatch" }
];

export default function PublicationSelector() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        C
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Publication</p>
        <select
          className="mt-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm"
          defaultValue={publications[0].id}
        >
          {publications.map((publication) => (
            <option key={publication.id} value={publication.id}>
              {publication.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
