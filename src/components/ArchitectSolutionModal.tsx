import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: string;
}

// THE MASTER LIST: Comprehensive components for FAANG-level designs
const CHALLENGE_CRITERIA: Record<string, { mustHave: string[]; advanced: string[] }> = {
  general: {
    mustHave: ["Client Interface", "Load Balancer", "API Gateway / App Server", "Primary Database (SQL/NoSQL)"],
    advanced: ["Distributed Caching (Redis)", "Authentication Service (JWT/OAuth)", "CDN for Static Assets", "Monitoring & Logging (ELK/Prometheus)"],
  },
  messenger: {
    mustHave: ["WebSocket Gateway (Real-time)", "Presence Service (Online/Last Seen Status)", "User/Auth Service", "Message Persistence (Distributed DB)"],
    advanced: ["Message Queue (Kafka/RabbitMQ)", "Push Notification Service (FCM/APNs)", "Media Storage (S3 + CDN)", "End-to-End Encryption (Signal Protocol)", "Delivery Receipts (Sent/Delivered/Read ACKs)"],
  },
  facebook: {
    mustHave: ["Global Load Balancer", "Feed Aggregator Service", "Post/Content Service", "Relational Database (User Profiles/Metadata)"],
    advanced: ["Fan-out Worker (Pre-computing Feeds)", "Graph Database (Social Ties/Friends of Friends)", "Redis Feed Cache", "CDN (Edge Media Delivery)", "Ranking/ML Relevancy Service"],
  },
  ecommerce: {
    mustHave: ["API Gateway (Rate Limiting)", "Inventory/Stock Service", "Transactional Database (ACID Compliance)", "Order Orchestrator"],
    advanced: ["Distributed Locking (Redis/Zookeeper)", "Inventory Buffer Queue", "Payment Gateway Integration (Saga Pattern)", "Search Cluster (Elasticsearch)", "Auto-scaling Worker Groups"],
  }
};

const ArchitectSolutionModal = ({ isOpen, onClose, challenge }: ModalProps) => {
  const criteria = CHALLENGE_CRITERIA[challenge] || CHALLENGE_CRITERIA.general;

  return (
    <AnimatePresence>
      {isOpen && (
        // FIX: items-start + overflow-y-auto ensures the top of the modal is never clipped
        <div className="fixed inset-0 z-[110] flex justify-center items-start overflow-y-auto p-4 md:p-12 bg-black/90 backdrop-blur-xl custom-scrollbar">
          
          {/* Backdrop Click-to-Close */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-0"
          />
          
          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            // FIX: Removed items-center from parent and added my-auto here for perfect centering when content fits
            className="relative z-10 my-auto max-w-3xl w-full bg-[#121212] border border-gold/30 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300"
          >
            {/* Header - Sticky if necessary */}
            <div className="p-8 border-b border-gold/10 bg-gold/5 flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-gold font-serif text-2xl tracking-widest uppercase">Senior Architect's Audit</h2>
                <p className="text-gold-light/50 text-[10px] uppercase tracking-widest">Industry Standard Review</p>
              </div>
              <button 
                onClick={onClose} 
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-gold/50 hover:text-gold hover:bg-white/10 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-8 md:p-10 space-y-10">
              
              {/* Level 1: Core Essentials */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/20" />
                  <h4 className="text-gold-light text-[10px] font-bold uppercase tracking-[0.3em] whitespace-nowrap">
                      Level 1: Core Essentials
                  </h4>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/20" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {criteria.mustHave.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-gold/20 transition-colors group">
                      <div className="h-5 w-5 rounded-full border border-gold/30 flex items-center justify-center group-hover:border-gold/60">
                        <div className="h-2 w-2 rounded-full bg-gold shadow-[0_0_10px_rgba(201,162,39,1)]" />
                      </div>
                      <span className="text-gray-300 text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Level 2: Advanced Maturity */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/10" />
                  <h4 className="text-gold-light text-[10px] font-bold uppercase tracking-[0.3em] whitespace-nowrap opacity-70">
                      Level 2: Senior Maturity
                  </h4>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {criteria.advanced.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-white/[0.01] rounded-2xl border border-white/[0.05] hover:border-gold/10 transition-colors group">
                      <div className="h-5 w-5 rounded-full border border-gold/10 flex items-center justify-center group-hover:border-gold/30">
                         <span className="text-gold/30 text-[10px] group-hover:text-gold/60">★</span>
                      </div>
                      <span className="text-gray-400 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Architect's Note */}
              <div className="pt-6 border-t border-white/5">
                <p className="text-[11px] text-gray-500 italic text-center leading-relaxed px-6">
                  "Senior interviews prioritize trade-offs. It is not about drawing every box, but explaining why you chose a specific database or messaging pattern for the bottlenecks of {challenge}."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ArchitectSolutionModal;