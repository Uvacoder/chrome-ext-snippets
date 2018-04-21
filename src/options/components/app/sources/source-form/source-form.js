import React, { Component } from 'react';
import Button from 'material-ui/Button';
import {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from 'material-ui/Dialog';
import { reduxForm, Fields } from 'redux-form';
import { composeValidators, combineValidators, isRequired } from 'revalidate';
import { LinearProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';
import ReduxFormTextField from '../../../lib/redux-form-text-field/redux-form-text-field';
import GithubAccessTokenHelperText from './github-access-token-helper-text/github-access-token-helper-text';

class SourceForm extends Component {
  componentWillReceiveProps(nextProps) {
    if (
      this.props.status === this.props.pendingStatus &&
      nextProps.status === 'SUCCESS'
    ) {
      // TODO: Move this to redux-saga?
      nextProps.onClose();
    }
  }

  render() {
    const {
      onClose,
      name,
      api,
      accessToken,
      owner,
      repo,
      path,
      handleSubmit,
      status,
      pendingStatus
    } = this.props;
    return (
      <form onSubmit={handleSubmit} noValidate>
        {status === pendingStatus ? <LinearProgress /> : null}
        <DialogTitle id="form-add-source">Add Source</DialogTitle>
        <DialogContent>
          {status === 'ERROR' ? (
            <DialogContentText>
              {/* TODO: When upgrading to final mui 1.0.0 gutterBottom and color props should work directly on the DialogContentText */}
              <Typography
                gutterBottom
                color="error"
                component="span"
                variant="subheading"
              >
                Something went wrong, please try again.
              </Typography>
            </DialogContentText>
          ) : null}
          <DialogContentText>
            To add snippets to the context menu, configure a GitHub source.
          </DialogContentText>
          <ReduxFormTextField
            {...name.input}
            meta={name.meta}
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            placeholder="This will show up in the context menu"
            type="text"
            fullWidth
          />
          <ReduxFormTextField
            {...api.input}
            meta={api.meta}
            margin="dense"
            id="api"
            label="Github API"
            type="url"
            placeholder="e.g. https://api.github.com"
            fullWidth
          />
          <ReduxFormTextField
            {...accessToken.input}
            meta={accessToken.meta}
            margin="dense"
            id="accessToken"
            label="GitHub Access Token"
            type="text"
            helperText={<GithubAccessTokenHelperText />}
            fullWidth
          />
          <ReduxFormTextField
            {...owner.input}
            meta={owner.meta}
            margin="dense"
            id="owner"
            label="Owner"
            type="text"
            helperText="Given https://github.com/facebook/react, the owner would be 'facebook'"
            fullWidth
          />
          <ReduxFormTextField
            {...repo.input}
            meta={repo.meta}
            margin="dense"
            id="repo"
            label="Repo"
            type="text"
            helperText="Given https://github.com/facebook/react, the repo would be 'react'"
            fullWidth
          />
          <ReduxFormTextField
            {...path.input}
            meta={path.meta}
            margin="dense"
            id="path"
            label="Path"
            type="text"
            placeholder="e.g. snippets"
            helperText="Relative to the root of the repo"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" variant="raised" color="primary">
            Add
          </Button>
        </DialogActions>
      </form>
    );
  }
}

const validate = combineValidators({
  name: composeValidators(isRequired)('Name'),
  api: composeValidators(isRequired)('GitHub API'),
  accessToken: composeValidators(isRequired)('GitHub Access Token'), // Could make this optional?
  owner: composeValidators(isRequired)('Owner'),
  repo: composeValidators(isRequired)('Repo'),
  path: composeValidators(isRequired)('Path')
});

export default reduxForm({
  validate
})(props => {
  return (
    <Fields
      {...props}
      names={['name', 'api', 'accessToken', 'owner', 'repo', 'path']}
      component={SourceForm}
    />
  );
});