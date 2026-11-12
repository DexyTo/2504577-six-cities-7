import { memo, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { SortType } from '../../const';

type SortingOptionsProps = {
  sortType: SortType;
  onSortChange: (sortType: SortType) => void;
};

function SortingOptions({
  sortType,
  onSortChange,
}: SortingOptionsProps): JSX.Element {
  const [isOpened, setIsOpened] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isOpened) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !formRef.current?.contains(event.target)
      ) {
        setIsOpened(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isOpened]);

  const handleOptionSelect = (option: SortType) => {
    onSortChange(option);
    setIsOpened(false);
  };

  return (
    <form
      className="places__sorting"
      ref={formRef}
      onSubmit={(event) => event.preventDefault()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpened(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsOpened(false);
        }
      }}
    >
      <span className="places__sorting-caption">Sort by</span>&nbsp;
      <button
        className="places__sorting-type button"
        type="button"
        onClick={() => setIsOpened((prev) => !prev)}
      >
        {sortType}
        <svg className="places__sorting-arrow" width="7" height="4">
          <use xlinkHref="#icon-arrow-select" />
        </svg>
      </button>
      <ul
        className={cn('places__options places__options--custom', {
          'places__options--opened': isOpened,
        })}
      >
        {Object.values(SortType).map((option) => (
          <li
            className={cn('places__option', {
              'places__option--active': option === sortType,
            })}
            key={option}
            tabIndex={0}
            onClick={() => handleOptionSelect(option)}
          >
            {option}
          </li>
        ))}
      </ul>
    </form>
  );
}

const MemoizedSortingOptions = memo(SortingOptions);
export default MemoizedSortingOptions;
