import React from 'react';
import PropTypes from 'prop-types';

const ProfileExperience = ({
  experience: { title, location, description },
}) => (
  <div>
    <h3 className='text-dark'>{title}</h3>
    <p>
      <strong>Description </strong>
      {description}
    </p>
  </div>
);

ProfileExperience.propTypes = {
  experience: PropTypes.array.isRequired,
};

export default ProfileExperience;
