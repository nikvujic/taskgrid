import type { Card } from '../../types';
import './CardItem.css';

interface Props {
  card: Card;
  onClick: () => void;
}

export default function CardItem({ card, onClick }: Props) {
  return (
    <div className="card-item" onClick={onClick}>
      <span className="card-title">{card.title}</span>
      {card.description && (
        <p className="card-description">{card.description}</p>
      )}
    </div>
  );
}
