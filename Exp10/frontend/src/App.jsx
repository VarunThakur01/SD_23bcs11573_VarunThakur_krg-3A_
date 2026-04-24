import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Search, Plus, X, MoreHorizontal, Calendar, AlignLeft, Tag, CheckSquare, Archive, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { useStore } from './store/useStore';
import { format } from 'date-fns';

function App() {
  const { lists, cards, members, boardBackground, setBoardBackground, resetBoardData, searchQuery, setSearchQuery, addList, deleteList, addCard, deleteCard, updateCard, moveCard, moveList } = useStore();
  const [newListTitle, setNewListTitle] = useState('');
  const [addingList, setAddingList] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = boardBackground;
  }, [boardBackground]);

  const onDragEnd = (result) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'list') {
      moveList(source.index, destination.index, draggableId);
      return;
    }

    moveCard(source.droppableId, destination.droppableId, source.index, destination.index, draggableId);
  };

  const handleAddList = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (newListTitle.trim()) {
      addList(newListTitle);
      setNewListTitle('');
      setAddingList(false);
    }
  };

  const LabelColors = ['#0079bf', '#eb5a46', '#61bd4f', '#f2d600', '#ff9f1a', '#c377e0'];

  return (
    <>
      <header className="header">
        <h1>Trello Clone</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '8px', top: '8px', color: 'rgba(255,255,255,0.7)' }} />
            <input
              type="text"
              className="search-input"
              style={{ paddingLeft: '32px' }}
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              if(window.confirm('Reset to Sample Dataset? All changes will be lost.')) resetBoardData();
            }}
            style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
          >
            Reset Board
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
            <span style={{ fontSize: '12px' }}>Bg:</span>
            <input 
              type="color" 
              value={boardBackground} 
              onChange={(e) => setBoardBackground(e.target.value)}
              style={{ width: '24px', height: '24px', padding: 0, border: 'none', cursor: 'pointer', background: 'transparent' }}
            />
          </div>
        </div>
      </header>

      <div className="board">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="list" direction={isMobile ? "vertical" : "horizontal"}>
            {(provided) => (
              <div
                className="board"
                style={{ padding: 0 }}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {lists.map((list, index) => (
                  <List
                    key={list.id}
                    list={list}
                    cards={cards}
                    members={members}
                    index={index}
                    searchQuery={searchQuery}
                    openCard={(id, lId) => setActiveCard({cardId: id, listId: lId})}
                  />
                ))}
                {provided.placeholder}

                {addingList ? (
                  <div className="list-container" style={{ padding: '8px' }} onKeyDown={e => {
                    if (e.key === 'Escape') setAddingList(false);
                  }}>
                    <input
                      autoFocus
                      className="textarea-input"
                      style={{ minHeight: '40px', marginBottom: '8px' }}
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="Enter list title..."
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddList(e);
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button type="button" onClick={handleAddList} style={{ padding: '6px 12px', background: '#0052cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add List</button>
                      <button type="button" onClick={() => setAddingList(false)} style={{ background: 'transparent', border: 'none', color: '#b6c2cf', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                  </div>
                ) : (
                  <button className="add-list-btn" onClick={() => setAddingList(true)}>
                    <Plus size={20} /> Add another list
                  </button>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {activeCard && (
        <CardModal
          activeCard={activeCard}
          cards={cards}
          members={members}
          close={() => setActiveCard(null)}
          updateCard={updateCard}
          deleteCard={deleteCard}
          LabelColors={LabelColors}
        />
      )}
    </>
  );
}

function List({ list, cards, members, index, searchQuery, openCard }) {
  const { deleteList, addCard } = useStore();
  const [newCardTitle, setNewCardTitle] = useState('');
  const [addingCard, setAddingCard] = useState(false);

  const handleAddCard = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (newCardTitle.trim()) {
      addCard(list.id, newCardTitle);
      setNewCardTitle('');
      setAddingCard(false);
    }
  };

  const filteredCards = list.cardIds
    .map(id => cards[id])
    .filter(c => c && c.title.toLowerCase().includes((searchQuery || '').toLowerCase()));

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`list-container ${snapshot.isDragging ? 'list-dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className="list-header" {...provided.dragHandleProps}>
            <span>{list.title}</span>
            <button className="del-btn" onClick={() => deleteList(list.id)}><X size={16} /></button>
          </div>
          
          <Droppable droppableId={list.id} type="card">
            {(provided) => (
              <div
                className="cards-container"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {filteredCards.map((card, idx) => (
                   <Draggable key={card.id} draggableId={card.id} index={idx}>
                     {(provided, snapshot) => (
                       <div
                         className={`card ${snapshot.isDragging ? 'card-dragging' : ''}`}
                         ref={provided.innerRef}
                         {...provided.draggableProps}
                         {...provided.dragHandleProps}
                         onClick={() => openCard(card.id, list.id)}
                       >
                         {card.coverImage && (
                           <div style={{ height: '120px', width: '100%', borderRadius: '4px', marginBottom: '8px', backgroundImage: `url(${card.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                         )}
                         {card.labels && card.labels.length > 0 && (
                            <div className="labels-container">
                              {card.labels.map(color => (
                                <div key={color} className="label" style={{ backgroundColor: color, height: '8px', padding: 0, width: '40px' }} />
                              ))}
                            </div>
                         )}
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                           <span>{card.title}</span>
                           <button 
                             className="del-btn" 
                             style={{ opacity: 0.5, padding: '2px' }}
                             onClick={(e) => {
                               e.stopPropagation();
                               deleteCard(list.id, card.id);
                             }}
                             title="Archive Card"
                           >
                             <Archive size={14} />
                           </button>
                         </div>
                         {card.dueDate && (
                            <span style={{ fontSize: '11px', color: '#b6c2cf', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px'}}>
                              <Calendar size={12}/> {format(new Date(card.dueDate), 'MMM d')}
                            </span>
                         )}
                         {card.memberIds && card.memberIds.length > 0 && (
                           <div style={{ display: 'flex', gap: '4px', marginTop: '8px', justifyContent: 'flex-end' }}>
                             {card.memberIds.map(mId => {
                               const m = members?.find(x => x.id === mId);
                               if(!m) return null;
                               return (
                                 <div key={m.id} title={m.name} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#172b4d', fontWeight: 'bold' }}>
                                   {m.name.charAt(0)}
                                 </div>
                               );
                             })}
                           </div>
                         )}
                       </div>
                     )}
                   </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div style={{ padding: '8px' }}>
            {addingCard ? (
              <div onKeyDown={e => {
                if (e.key === 'Escape') setAddingCard(false);
              }}>
                <textarea
                  autoFocus
                  className="textarea-input"
                  style={{ minHeight: '60px', marginBottom: '8px' }}
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Enter a title for this card..."
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddCard(e);
                    }
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button type="button" onClick={handleAddCard} style={{ padding: '6px 12px', background: '#0052cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add card</button>
                  <button type="button" onClick={() => setAddingCard(false)} style={{ background: 'transparent', border: 'none', color: '#b6c2cf', cursor: 'pointer' }}><X size={20} /></button>
                </div>
              </div>
            ) : (
              <button className="add-btn" style={{ width: '100%' }} onClick={() => setAddingCard(true)}>
                <Plus size={16} /> Add a card
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

function CardModal({ activeCard, cards, members, close, updateCard, deleteCard, LabelColors }) {
  const card = cards[activeCard.cardId];
  const [newItem, setNewItem] = useState('');
  const [newComment, setNewComment] = useState('');
  if(!card) return null;

  const toggleLabel = (color) => {
    const hasLabel = card.labels?.includes(color);
    const newLabels = hasLabel
      ? card.labels.filter(l => l !== color)
      : [...(card.labels || []), color];
    updateCard(card.id, { labels: newLabels });
  };

  const addChecklistItem = () => {
    if (newItem.trim()) {
      const newChecklist = [...(card.checklist || []), { id: Date.now().toString(), text: newItem, isCompleted: false }];
      updateCard(card.id, { checklist: newChecklist });
      setNewItem('');
    }
  };

  const toggleChecklistItem = (itemId) => {
    const newChecklist = card.checklist.map(item => 
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    updateCard(card.id, { checklist: newChecklist });
  };

  const toggleMember = (memberId) => {
    const hasMember = card.memberIds?.includes(memberId);
    const newMembers = hasMember
      ? card.memberIds.filter(id => id !== memberId)
      : [...(card.memberIds || []), memberId];
    updateCard(card.id, { memberIds: newMembers });
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCard(card.id, { coverImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addComment = () => {
    if (newComment.trim()) {
      const commentObj = { id: Date.now().toString(), text: newComment, date: new Date().toISOString() };
      updateCard(card.id, { comments: [...(card.comments || []), commentObj] });
      setNewComment('');
    }
  };

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden' }}>
        {card.coverImage && (
          <div style={{ height: '160px', width: '100%', backgroundImage: `url(${card.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
             <button className="modal-close" onClick={close} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%' }}><X size={24} /></button>
          </div>
        )}
        <div style={{ padding: '24px' }}>
          <div className="modal-header" style={{ marginBottom: card.coverImage ? '16px' : '24px' }}>
             <input
               className="modal-title-input"
               value={card.title}
               onChange={e => updateCard(card.id, { title: e.target.value })}
             />
             {!card.coverImage && <button className="modal-close" onClick={close}><X size={24} /></button>}
          </div>
          
          <div className="modal-body">
            <div style={{ flex: 1 }}>
            
            <div className="section-title">
              <AlignLeft size={20} /> Description
            </div>
            <textarea
              className="textarea-input"
              style={{ marginBottom: '24px' }}
              value={card.description || ''}
              onChange={e => updateCard(card.id, { description: e.target.value })}
              placeholder="Add a more detailed description..."
            />

            <div className="section-title">
              <Calendar size={20} /> Due Date
            </div>
            <input
              type="date"
              className="textarea-input"
              style={{ minHeight: 'auto', marginBottom: '24px' }}
              value={card.dueDate || ''}
              onChange={e => updateCard(card.id, { dueDate: e.target.value })}
            />

            <div className="section-title">
              <CheckSquare size={20} /> Checklist
            </div>
            <div style={{ marginBottom: '24px' }}>
              {(card.checklist || []).map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={item.isCompleted} 
                    onChange={() => toggleChecklistItem(item.id)} 
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }} 
                  />
                  <span style={{ textDecoration: item.isCompleted ? 'line-through' : 'none', color: item.isCompleted ? '#8c9bab' : '#b6c2cf' }}>
                    {item.text}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input
                  className="textarea-input"
                  style={{ minHeight: 'auto', flex: 1 }}
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                  placeholder="Add an item..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') addChecklistItem();
                  }}
                />
                <button type="button" onClick={addChecklistItem} style={{ padding: '6px 12px', background: '#0052cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add</button>
              </div>
            </div>

            <div className="section-title" style={{ marginTop: '32px' }}>
              <MessageSquare size={20} /> Activity & Comments
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0052cc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>
                U
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  className="textarea-input"
                  style={{ minHeight: '40px', marginBottom: '8px' }}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                />
                <button type="button" onClick={addComment} style={{ padding: '6px 12px', background: '#0052cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(card.comments || []).slice().reverse().map(comment => (
                <div key={comment.id} style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0052cc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#fff', fontWeight: 'bold', flexShrink: 0 }}>
                    U
                  </div>
                  <div>
                    <div>
                      <span style={{ fontWeight: 'bold', color: '#fff', marginRight: '8px' }}>User</span>
                      <span style={{ fontSize: '12px', color: '#b6c2cf' }}>{format(new Date(comment.date), 'MMM d, h:mm a')}</span>
                    </div>
                    <div style={{ backgroundColor: '#22272b', padding: '8px 12px', borderRadius: '4px', marginTop: '4px', color: '#b6c2cf' }}>
                      {comment.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-sidebar">
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#b6c2cf' }}>MEMBERS</span>
            <div className="labels-container" style={{ flexDirection: 'column', marginBottom: '16px' }}>
              {(members || []).map(m => (
                <button
                  key={m.id}
                  className="label"
                  title={m.name}
                  style={{
                    backgroundColor: m.color,
                    padding: '6px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: card.memberIds?.includes(m.id) ? '2px solid #fff' : 'none',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onClick={() => toggleMember(m.id)}
                >
                  <span style={{color: '#172b4d'}}>{m.name}</span>
                </button>
              ))}
            </div>

            <span style={{ fontSize: '12px', fontWeight: 600, color: '#b6c2cf' }}>LABELS</span>
            <div className="labels-container" style={{ flexDirection: 'column' }}>
              {LabelColors.map(color => (
                <button
                  key={color}
                  className="label"
                  style={{
                    backgroundColor: color,
                    padding: '6px',
                    height: '24px',
                    border: card.labels?.includes(color) ? '2px solid #fff' : 'none',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onClick={() => toggleLabel(color)}
                />
              ))}
            </div>

            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#b6c2cf' }}>ACTIONS</span>
            <label style={{
                 padding: '8px', background: '#22272b', color: '#b6c2cf', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'
            }}>
               <ImageIcon size={16} /> Cover Image
               <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
            </label>
            <button
               style={{
                 padding: '8px', background: '#f5cd47', color: '#172b4d', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, width: '100%'
               }}
               onClick={() => {
                 deleteCard(activeCard.listId, card.id);
                 close();
               }}
            >
               Delete Card
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default App;
