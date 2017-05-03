<?php
/**
 * @package   AkeebaLoginGuard
 * @copyright Copyright (c)2016-2017 Akeeba Ltd
 * @license   GNU General Public License version 3, or later
 */

// Prevent direct access
defined('_JEXEC') or die;

/** @var LoginGuardViewCaptive $this */

$shownMethods = array();

?>
<div id="loginguard-select">
    <h3 id="loginguard-select-heading">
        <?php echo JText::_('COM_LOGINGUARD_HEAD_SELECT_PAGE'); ?>
    </h3>
    <div id="loginguard-select-information">
        <p>
	        <?php echo JText::_('COM_LOGINGUARD_LBL_SELECT_INSTRUCTIONS'); ?>
        </p>
    </div>

	<?php foreach ($this->records as $record):
    if (!array_key_exists($record->method, $this->tfaMethods)) continue;

	if ($this->allowEntryBatching)
    {
	    if ($this->tfaMethods[$record->method]['allowEntryBatching'] && in_array($record->method, $shownMethods)) continue;
	    $shownMethods[] = $record->method;
    }

    $methodName = $this->getModel()->translateMethodName($record->method);
    ?>
    <a href="<?php echo JRoute::_('index.php?option=com_loginguard&view=captive&record_id=' . $record->id)?>" class="loginguard-method">
        <img src="<?php echo JUri::root() . $this->getModel()->getMethodImage($record->method) ?>" class="loginguard-method-image" />
        <?php if (!$this->allowEntryBatching || !$this->tfaMethods[$record->method]['allowEntryBatching']): ?>
        <span class="loginguard-method-title">
            <?php echo $this->escape($record->title) ?>
        </span>
        <span class="loginguard-method-name">
            <?php echo $methodName ?>
        </span>
        <?php else: ?>
            <span class="loginguard-method-title">
            <?php echo $methodName ?>
        </span>
            <span class="loginguard-method-name">
            <?php echo $methodName ?>
        </span>
        <?php endif; ?>
    </a>
	<?php endforeach; ?>
</div>