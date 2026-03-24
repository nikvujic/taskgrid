import type { Board, List } from '../../types';
import CardItem from '../CardItem/CardItem';
import AddCardForm from '../AddCardForm/AddCardForm';
import './ListColumn.css';

interface Props {
  board: Board;
  list: List;
}

export default function ListColumn({ board, list }: Props) {
  return (
    <div className="list-column">
      <div className="list-header">
        <span className="list-name">{list.name}</span>
        <span className="list-count">{list.cards.length}</span>
      </div>
      <div className="list-cards">
        {list.cards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </div>
      <AddCardForm boardId={board.id} listId={list.id} />
    </div>
  );
}
