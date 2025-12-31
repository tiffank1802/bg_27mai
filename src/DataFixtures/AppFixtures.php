<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Author;
use App\Entity\Editor;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private UserPasswordHasherInterface $passwordHasher)
    {
    }

    public function load(ObjectManager $manager): void
    {
        // Create authors
        $authors = [
            'Victor Hugo',
            'Albert Camus',
            'Gustave Flaubert',
            'Marcel Proust',
            'Émile Zola',
            'Honoré de Balzac',
            'Stendhal',
            'François Mauriac',
            'André Malraux',
            'Simone de Beauvoir',
        ];

        foreach ($authors as $authorName) {
            $author = new Author();
            $author->setName($authorName);
            $author->setDateOfBirth(new \DateTimeImmutable('1800-01-01')); // Date par défaut
            $manager->persist($author);
        }

        // Create editors
        $editors = [
            'Gallimard',
            'Folio',
            'Le Livre de Poche',
            'Flammarion',
            'Seuil',
            'Albin Michel',
            'Actes Sud',
            'Grasset',
            'Fayard',
            'Stock',
        ];

        foreach ($editors as $editorName) {
            $editor = new Editor();
            $editor->setName($editorName);
            $manager->persist($editor);
        }

        // Create admin user
        $admin = new User();
        $admin->setEmail('admin@bibliogest.com');
        $admin->setFirstname('Admin');
        $admin->setLastname('Bibliogest');
        $admin->setUsername('admin');
        $admin->setRoles(['ROLE_ADMIN']);
        // Temporarily set a simple role to avoid array conversion issues
        // $admin->setRoles('ROLE_ADMIN');
        $admin->setPassword($this->passwordHasher->hashPassword($admin, '180201'));

        $manager->persist($admin);

        $manager->flush();
    }
}
