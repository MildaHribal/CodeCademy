import { Link } from 'react-router';
import FavouriteButton from './FavouriteButton';
import { formatMinutes } from '../lib/recipes';
import type { Recipe } from '../lib/types';

const TAG_NAMES: Record<string, string> = {
  maso: 'maso',
  bezmasa: 'bez masa',
  ryba: 'ryba',
  moucnik: 'moučník',
};

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <li className="card">
      <div className="card-head">
        <h2><Link to={`/recept/${recipe.id}`}>{recipe.name}</Link></h2>
        <FavouriteButton recipeId={recipe.id} name={recipe.name} />
      </div>
      <p className="meta">
        <span className="tag">{TAG_NAMES[recipe.tag] ?? recipe.tag}</span>
        <span>{formatMinutes(recipe.minutes)}</span>
        <span>{recipe.portions} porce</span>
      </p>
    </li>
  );
}
