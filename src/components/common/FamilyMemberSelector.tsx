import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FamilyMemberSelectorProps {
  selectedMemberId: string;
  onMemberChange: (memberId: string) => void;
  members: Array<{
    id: string;
    name: string;
    avatar: string;
    color: string;
  }>;
  className?: string;
}

export const FamilyMemberSelector: React.FC<FamilyMemberSelectorProps> = ({
  selectedMemberId,
  onMemberChange,
  members,
  className = ''
}) => {
  // Get current selected member
  const selectedMember = members.find(member => member.id === selectedMemberId) || members[0];
  
  // Get current member index for navigation
  const currentIndex = members.findIndex(member => member.id === selectedMemberId);
  
  const handlePrevMember = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : members.length - 1;
    onMemberChange(members[prevIndex].id);
  };

  const handleNextMember = () => {
    const nextIndex = currentIndex < members.length - 1 ? currentIndex + 1 : 0;
    onMemberChange(members[nextIndex].id);
  };

  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMember}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          aria-label="Vorheriges Familienmitglied"
        >
          <ChevronLeft className="w-5 h-5 text-white/60" />
        </button>
        
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 bg-gradient-to-br ${selectedMember.color} rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg ring-2 ring-white/20`}>
            {selectedMember.avatar}
          </div>
          <div className="text-center mt-2">
            <p className="text-white font-medium">{selectedMember.name}</p>
            <p className="text-white/60 text-sm">{selectedMember.role}</p>
          </div>
        </div>
        
        <button
          onClick={handleNextMember}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          aria-label="Nächstes Familienmitglied"
        >
          <ChevronRight className="w-5 h-5 text-white/60" />
        </button>
      </div>
    </div>
  );
};