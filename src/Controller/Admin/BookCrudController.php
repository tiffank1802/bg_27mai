<?php

namespace App\Controller\Admin;

use App\Entity\Book;
use App\Enum\BookStatus;

use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateField;
use EasyCorp\Bundle\EasyAdminBundle\Field\FormField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class BookCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Book::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            FormField::addColumn(4),
            TextField::new('title'),
            TextField::new('isbn'),
            TextField::new('cover'),
            DateField::new('EditedAt'),
            FormField::addColumn(4),
            TextEditorField::new('Plot'),
            IntegerField::new('pageNumber'),
            // TextField::new('status'),//->setEntryToStringMethod('getLabel'),
            ChoiceField::new('status')
            ->setChoices(array_combine(
                array_map(fn($case) => ucfirst($case->getLabel()), BookStatus::cases()),
                BookStatus::cases()
            ))
            ->renderAsNativeWidget(), // ou .renderExpanded() pour des boutons radios
            AssociationField::new('editor')
            ->setFormTypeOption('choice_label', 'name'), // le nom affiché dans le menu déroulant
            AssociationField::new('authors')
            ->setFormTypeOption('choice_label', 'name') // le nom affiché dans le menu déroulant

        ];
    }
}
