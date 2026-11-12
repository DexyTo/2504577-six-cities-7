import type { ReviewData } from '../../const';
import Review from '../review/review';

type ReviewsListProps = {
  reviews: ReviewData[];
};

const MAX_VISIBLE_REVIEWS = 10;

function ReviewsList({ reviews }: ReviewsListProps): JSX.Element {
  const latestReviews = [...reviews]
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, MAX_VISIBLE_REVIEWS);

  return (
    <>
      <h2 className="reviews__title">
        Reviews · <span className="reviews__amount">{reviews.length}</span>
      </h2>
      <ul className="reviews__list">
        {latestReviews.map((review) => (
          <Review key={review.id} review={review} />
        ))}
      </ul>
    </>
  );
}

export default ReviewsList;
