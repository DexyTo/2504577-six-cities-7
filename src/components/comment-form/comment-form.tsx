import { Fragment, useState, type FormEvent } from 'react';
import type { NewComment, ReviewData } from '../../const';
import { useAppDispatch } from '../../hooks';
import { postComment } from '../../store/api-action';

type CommentFormProps = {
  offerId: string;
  onCommentPosted: (review: ReviewData) => void;
};

const MIN_COMMENT_LENGTH = 50;
const MAX_COMMENT_LENGTH = 300;
const EMPTY_COMMENT: NewComment = { rating: 0, comment: '' };

const ratingTitles: Record<string, string> = {
  '5': 'perfect',
  '4': 'good',
  '3': 'not bad',
  '2': 'badly',
  '1': 'terribly',
};

function CommentForm({
  offerId,
  onCommentPosted,
}: CommentFormProps): JSX.Element {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState(EMPTY_COMMENT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);
  const comment = formData.comment.trim();
  const canSubmit =
    !isSubmitting &&
    formData.rating > 0 &&
    comment.length >= MIN_COMMENT_LENGTH &&
    comment.length <= MAX_COMMENT_LENGTH;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setHasSubmitError(false);
    const action = await dispatch(
      postComment({ offerId, comment: { rating: formData.rating, comment } }),
    );
    setIsSubmitting(false);

    if (postComment.fulfilled.match(action)) {
      onCommentPosted(action.payload);
      setFormData(EMPTY_COMMENT);
    } else {
      setHasSubmitError(true);
    }
  };

  return (
    <form
      className="reviews__form form"
      onSubmit={(event) => void handleSubmit(event)}
    >
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
              checked={formData.rating === Number(rating)}
              disabled={isSubmitting}
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
        value={formData.comment}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, comment: e.target.value }));
        }}
        placeholder="Tell how was your stay, what you like and what can be improved"
        minLength={MIN_COMMENT_LENGTH}
        maxLength={MAX_COMMENT_LENGTH}
        disabled={isSubmitting}
      />
      <div className="reviews__button-wrapper">
        <p className="reviews__help">
          To submit review please make sure to set&nbsp;
          <span className="reviews__star">rating</span> and describe your stay
          with at least&nbsp;
          <b className="reviews__text-amount">
            {MIN_COMMENT_LENGTH} characters
          </b>
          .
        </p>
        <button
          className="reviews__submit form__submit button"
          type="submit"
          disabled={!canSubmit}
        >
          Submit
        </button>
      </div>
      {hasSubmitError ? (
        <p role="alert">Could not post your review. Please try again.</p>
      ) : null}
    </form>
  );
}

export default CommentForm;
