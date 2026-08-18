import { Info, ExternalLink } from 'lucide-react';

const softwareGrid = [
  { category: 'Frontend', tool: 'React', version: '18.3', purpose: 'UI component library', license: 'MIT' },
  { category: 'Frontend', tool: 'TypeScript', version: '5.6', purpose: 'Type safety and developer experience', license: 'Apache 2.0' },
  { category: 'Frontend', tool: 'Vite', version: '6.0', purpose: 'Build tooling and dev server', license: 'MIT' },
  { category: 'Frontend', tool: 'Tailwind CSS', version: '3.4', purpose: 'Utility-first CSS framework', license: 'MIT' },
  { category: 'Frontend', tool: 'React Router', version: '6.28', purpose: 'Client-side routing', license: 'MIT' },
  { category: 'Frontend', tool: 'Lucide React', version: '0.460', purpose: 'Icon library', license: 'ISC' },
  { category: 'Frontend', tool: 'Recharts', version: '2.15', purpose: 'Data visualisation charts', license: 'MIT' },
  { category: 'Backend', tool: 'Node.js', version: '20.x', purpose: 'Server runtime', license: 'MIT' },
  { category: 'Backend', tool: 'Express', version: '4.21', purpose: 'HTTP server framework', license: 'MIT' },
  { category: 'Backend', tool: 'SQLite', version: '3.x', purpose: 'Embedded relational database', license: 'Public Domain' },
  { category: 'Backend', tool: 'better-sqlite3', version: '11.6', purpose: 'Node.js SQLite driver', license: 'MIT' },
  { category: 'Backend', tool: 'Multer', version: '1.4', purpose: 'File upload middleware', license: 'MIT' },
  { category: 'Auth', tool: 'jsonwebtoken', version: '9.0', purpose: 'JWT token generation/validation', license: 'MIT' },
  { category: 'Auth', tool: 'bcryptjs', version: '2.4', purpose: 'Password hashing', license: 'MIT' },
  { category: 'DevOps', tool: 'Git', version: '—', purpose: 'Version control', license: 'GPL-2.0' },
  { category: 'DevOps', tool: 'tsx', version: '4.19', purpose: 'TypeScript execution for server', license: 'MIT' },
  { category: 'DevOps', tool: 'concurrently', version: '9.1', purpose: 'Run multiple dev processes', license: 'MIT' },
  { category: 'AI/CV', tool: 'TBD', version: '—', purpose: 'Handwriting recognition model (planned)', license: '—' },
];

const categories = Array.from(new Set(softwareGrid.map(s => s.category)));

export default function SoftwareGridPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">Software Grid</h1>
      <p className="page-subtitle">Technology stack and tools used in the Pharmacon project.</p>

      <div className="max-w-5xl space-y-8">
        {/* Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 items-start animate-in">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            This grid reflects the current technology choices. Tools marked as "TBD" are planned for future phases.
            All tools are open-source or freely available.
          </p>
        </div>

        {/* Grid by category */}
        {categories.map((category, ci) => (
          <section key={category} className="animate-in" style={{ animationDelay: `${ci * 0.05}s` }}>
            <h2 className="section-heading">{category}</h2>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="table-header">Tool</th>
                    <th className="table-header">Version</th>
                    <th className="table-header">Purpose</th>
                    <th className="table-header">License</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {softwareGrid
                    .filter(s => s.category === category)
                    .map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="table-cell font-medium text-slate-800">{item.tool}</td>
                      <td className="table-cell font-mono text-xs">{item.version}</td>
                      <td className="table-cell text-slate-600">{item.purpose}</td>
                      <td className="table-cell">
                        <span className="badge-slate">{item.license}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {/* Summary */}
        <section className="animate-in">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="stat-value">{softwareGrid.length}</div>
              <div className="stat-label">Tools & Libraries</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{categories.length}</div>
              <div className="stat-label">Categories</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{softwareGrid.filter(s => s.license === 'MIT').length}</div>
              <div className="stat-label">MIT Licensed</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
