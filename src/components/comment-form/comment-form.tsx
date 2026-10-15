import { Fragment, useState } from 'react';

type ReviewFormState = {
  rating: number;
  review: string;
};

const ratingTitles: Record<string, string> = {
  '5': 'perfect',
  '4': 'good',
  '3': 'not bad',
  '2': 'badly',
  '1': 'terribly',
};

function CommentForm(): JSX.Element {
  const [formData, setFormData] = useState<ReviewFormState>({
    rating: 0,
    review: '',
  });

  return (
    <form className="reviews__form form" action="#" method="post">
      <label className="reviews__label form__label" htmlFor="review">
        Your review
      </label>
      <div className="reviews__rating-form form__rating">
        {['5', '4', '3', '2', '1'].map((rating) => (
          <Fragment key={rating}>
            <input
              className="form__rating-input visually-hidden"
              name="rating"
              value={rating}
              id={`${rating}-stars`}
              type="radio"
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  rating: Number(e.target.value),
                }));
              }}
            />
            <label
              htmlFor={`${rating}-stars`}
              className="reviews__rating-label form__rating-label"
              title={ratingTitles[rating]}
            >
              <svg className="form__star-image" width="37" height="33">
                <use xlinkHref="#icon-star" />
              </svg>
            </label>
          </Fragment>
        ))}
      </div>
      <textarea
        className="reviews__textarea form__textarea"
        id="review"
        name="review"
        value={formData.review}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, review: e.target.value }));
        }}
        placeholder="Tell how was your stay, what you like and what can be improved"
        minLength={50}
      >
      </textarea>
      <div className="reviews__button-wrapper">
        <p className="reviews__help">
          To submit review please make sure to set{' '}
          <span className="reviews__star">rating</span> and describe your stay
          with at least <b className="reviews__text-amount">50 characters</b>.
        </p>
        <button
          className="reviews__submit form__submit button"
          type="submit"
          disabled
        >
          Submit
        </button>
      </div>
    </form>
  );
}

export default CommentForm;
