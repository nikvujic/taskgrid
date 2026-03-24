import type { Card } from '../../types';
import './CardItem.css';

interface Props {
  card: Card;
}

export default function CardItem({ card }: Props) {
  return (
    <div className="card-item">
      <span className="card-title">{card.title}</span>
    </div>
  );
}
