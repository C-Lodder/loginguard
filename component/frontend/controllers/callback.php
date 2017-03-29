<?php
/**
 * @package   AkeebaLoginGuard
 * @copyright Copyright (c)2016-2017 Akeeba Ltd
 * @license   GNU General Public License version 3, or later
 */

// Prevent direct access
defined('_JEXEC') or die;

class LoginGuardControllerCallback extends JControllerLegacy
{
	/**
	 * Constructor.
	 *
	 * @param   array  $config  An optional associative array of configuration settings.
	 * Recognized key values include 'name', 'default_task', 'model_path', and
	 * 'view_path' (this list is not meant to be comprehensive).
	 */
	public function __construct(array $config = array())
	{
		parent::__construct($config);

		$this->registerDefaultTask('callback');
	}

	/**
	 * Implement a callback feature, typically used for OAuth2 authentication
	 *
	 * @param   bool   $cachable   Can this view be cached
	 * @param   array  $urlparams  An array of safe url parameters and their variable types, for valid values see {@link JFilterInput::clean()}.
	 *
	 * @return  JControllerLegacy   The current JControllerLegacy object to support chaining.
	 */
	public function callback($cachable = false, $urlparams = false)
	{
		// Get the method and make sure it's non-empty
		$method = $this->input->getCmd('method', '');

		if (empty($method))
		{
			throw new RuntimeException(JText::_('JERROR_ALERTNOAUTHOR'), 403);
		}

		// Trigger the onLoginGuardCallback plugin event
		$results = LoginGuardHelperTfa::runPlugins('onLoginGuardCallback', array($method));

		/**
		 * The first plugin to handle the request should either redirect or close the application. If we are still here
		 * no plugin handled the request. So all we can do is close the application, i.e. die gracefully.
		 */
		JFactory::getApplication()->close();

		// This is a useless line which never runs. It's here just to make code analyzers happy.
		return $this;
	}
}