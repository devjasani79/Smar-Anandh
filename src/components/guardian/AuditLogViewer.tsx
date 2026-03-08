import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown, ChevronUp, Pill, User, Users } from 'lucide-react';
import { useAuditLogs, AuditLog } from '@/hooks/useAuditLogs';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const TABLE_LABELS: Record<string, { label: string; icon: typeof Pill }> = {
  medications: { label: 'Medications', icon: Pill },
  seniors: { label: 'Senior Profile', icon: User },
  family_members: { label: 'Family Members', icon: Users },
  medication_logs: { label: 'Medication Logs', icon: Pill },
};

function getChangeDescription(log: AuditLog): string {
  const table = TABLE_LABELS[log.table_name]?.label || log.table_name;

  if (log.operation === 'INSERT') {
    const name = log.new_values?.name || log.new_values?.full_name || '';
    return `Added new ${table.toLowerCase()}${name ? `: ${name}` : ''}`;
  }

  if (log.operation === 'DELETE') {
    const name = log.old_values?.name || log.old_values?.full_name || '';
    return `Deleted ${table.toLowerCase()}${name ? `: ${name}` : ''}`;
  }

  // UPDATE - show changed fields
  if (log.old_values && log.new_values) {
    const changed = Object.keys(log.new_values).filter(
      (key) =>
        !['updated_at', 'created_at', 'id'].includes(key) &&
        JSON.stringify(log.old_values![key]) !== JSON.stringify(log.new_values![key])
    );
    if (changed.length > 0) {
      const name = log.new_values.name || log.old_values.name || '';
      return `Updated ${table.toLowerCase()}${name ? ` "${name}"` : ''}: ${changed.join(', ')}`;
    }
  }

  return `${log.operation} on ${table}`;
}

function getOperationColor(op: string) {
  switch (op) {
    case 'INSERT': return 'bg-success/15 text-success';
    case 'UPDATE': return 'bg-primary/15 text-primary';
    case 'DELETE': return 'bg-destructive/15 text-destructive';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function AuditLogViewer() {
  const { data: logs = [], isLoading } = useAuditLogs();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-warm p-6"
    >
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-primary" />
        Recent Changes (Audit Log)
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Track all changes made to medications and senior profiles.
      </p>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading audit logs">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">
          No changes recorded yet
        </p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {logs.map((log) => {
            const Icon = TABLE_LABELS[log.table_name]?.icon || History;
            const isExpanded = expanded === log.id;

            return (
              <div key={log.id} className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : log.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getChangeDescription(log)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getOperationColor(log.operation)}`}>
                        {log.operation}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.changed_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 text-xs space-y-2">
                        {log.old_values && (
                          <div>
                            <span className="font-medium text-muted-foreground">Previous:</span>
                            <pre className="mt-1 p-2 bg-muted/50 rounded-lg overflow-x-auto text-foreground">
                              {JSON.stringify(log.old_values, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.new_values && (
                          <div>
                            <span className="font-medium text-muted-foreground">New:</span>
                            <pre className="mt-1 p-2 bg-muted/50 rounded-lg overflow-x-auto text-foreground">
                              {JSON.stringify(log.new_values, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
