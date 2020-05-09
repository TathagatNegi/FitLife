import React, { Fragment, useState } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addExperience } from '../../actions/profile';

const AddExperience = ({ addExperience, history }) => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
  });

  const { title, location, description } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <Fragment>
      <h1 class='large text-primary'>Add An Experience</h1>
      <p class='lead'>
        <i class='fas fa-code-branch'></i> Add any Trainer positions that you
        have had in the past
      </p>
      <small>* = required field</small>
      <form
        class='form'
        onSubmit={(e) => {
          e.preventDefault();
          addExperience(formData, history);
        }}
      >
        <div class='form-group'>
          <input
            type='text'
            placeholder='*Title'
            name='title'
            value={title}
            onChange={(e) => onChange(e)}
            required
          />
        </div>

        <div class='form-group'>
          <input
            type='text'
            placeholder='Location'
            name='location'
            value={location}
            onChange={(e) => onChange(e)}
          />
        </div>

        <div class='form-group'>
          <textarea
            name='description'
            cols='30'
            rows='5'
            placeholder='Job Description'
            value={description}
            onChange={(e) => onChange(e)}
          ></textarea>
        </div>
        <input type='submit' class='btn btn-primary my-1' />
        <a class='btn btn-light my-1' href='dashboard.html'>
          Go Back
        </a>
      </form>
    </Fragment>
  );
};

AddExperience.propTypes = {
  addExperience: PropTypes.func.isRequired,
};

export default connect(null, { addExperience })(withRouter(AddExperience));
