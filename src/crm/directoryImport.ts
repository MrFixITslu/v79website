/** Parse an owner-supplied CSV/JSON file. No network scraping or AI extraction. */
export const DIRECTORY_FIELDS = [
  "businessName", "category", "industry", "location", "phone", "email",
  "website", "facebookUrl", "instagramUrl", "linkedinUrl", "description", "sourceUrl"
] as const;
export type DirectoryRecord = { businessName: string; [key: string]: string };

function csvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i=0; i<input.length; i++) {
    const c=input[i];
    if (quoted) {
      if (c==='"' && input[i+1]==='"') { cell+='"'; i++; }
      else if (c==='"') quoted=false;
      else cell+=c;
    } else if (c==='"') {
      if (cell !== "") throw Error("Invalid CSV quoting.");
      quoted=true;
    } else if (c===",") { row.push(cell); cell=""; }
    else if (c==="\n" || c==="\r") {
      if (c==="\r" && input[i+1]==="\n") i++;
      row.push(cell); cell="";
      if (row.some(x=>x.trim())) rows.push(row);
      row=[];
    } else cell+=c;
  }
  if (quoted) throw Error("Incomplete quoted CSV field.");
  row.push(cell);
  if (row.some(x=>x.trim())) rows.push(row);
  if (rows.length>501) throw Error("Maximum 500 business rows per import.");
  return rows;
}

export function parseDirectoryFile(filename: string, contents: string): DirectoryRecord[] {
  if (contents.length>1_000_000) throw Error("Import exceeds the 1 MB limit.");
  let raw: unknown;
  if (filename.toLowerCase().endsWith(".json")) {
    raw=JSON.parse(contents);
  } else if (filename.toLowerCase().endsWith(".csv")) {
    const rows=csvRows(contents.replace(/^\uFEFF/, ""));
    const header=(rows.shift()||[]).map(x=>x.trim());
    if (!header.includes("businessName") || new Set(header).size!==header.length ||
        header.some(h=>!DIRECTORY_FIELDS.includes(h as typeof DIRECTORY_FIELDS[number]))) {
      throw Error("CSV needs a businessName column and only supported field headings.");
    }
    raw=rows.map(row=>{
      if (row.length>header.length) throw Error("Extra CSV columns found.");
      const record:Record<string,string>={};
      header.forEach((field,i)=>record[field]=(row[i]||"").trim());
      return record;
    });
  } else throw Error("Select a CSV or JSON business-directory file.");

  if (!Array.isArray(raw) || raw.length===0 || raw.length>500) {
    throw Error("Import must contain 1–500 business records.");
  }
  const records:DirectoryRecord[]=[];
  const seen=new Set<string>();
  for(const item of raw) {
    if(!item || typeof item!=="object" || Array.isArray(item))throw Error("Each entry must be a business object.");
    const entry:Record<string,string>={};
    for(const [key,value] of Object.entries(item)) {
      if(!DIRECTORY_FIELDS.includes(key as typeof DIRECTORY_FIELDS[number]) ||
          typeof value!=="string" || value.length>4000)throw Error("Unsupported field or text longer than 4000 characters.");
      entry[key]=value.trim();
    }
    if(!entry.businessName || entry.businessName.length>200)throw Error("Every row needs a businessName (max 200 characters).");
    const name=entry.businessName.toLocaleLowerCase("en");
    if(seen.has(name))continue;
    seen.add(name);
    records.push(entry as DirectoryRecord);
  }
  return records;
}
