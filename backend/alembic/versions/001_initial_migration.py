"""Initial migration with all tables

Revision ID: 001_initial_migration
Revises: 
Create Date: 2025-08-25 16:35:25.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '001_initial_migration'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('clients',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('phone', sa.String(), nullable=False),
    sa.Column('address', sa.String(), nullable=False),
    sa.Column('tax_id', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('version', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('cases',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('case_name', sa.String(), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('client_id', sa.String(), nullable=False),
    sa.Column('client_name', sa.String(), nullable=False),
    sa.Column('case_type', sa.String(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('court', sa.String(), nullable=False),
    sa.Column('case_number', sa.String(), nullable=False),
    sa.Column('defendant', sa.String(), nullable=False),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('start_date', sa.Date(), nullable=False),
    sa.Column('next_hearing_date', sa.Date(), nullable=True),
    sa.Column('reminder_date', sa.Date(), nullable=True),
    sa.Column('office_archive_no', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('version', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('compensation_letters',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('client_id', sa.String(), nullable=False),
    sa.Column('client_name', sa.String(), nullable=False),
    sa.Column('letter_number', sa.String(), nullable=False),
    sa.Column('bank', sa.String(), nullable=False),
    sa.Column('customer_number', sa.String(), nullable=False),
    sa.Column('customer', sa.String(), nullable=False),
    sa.Column('court', sa.String(), nullable=False),
    sa.Column('case_number', sa.String(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('description_text', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('version', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('executions',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('client_id', sa.String(), nullable=False),
    sa.Column('client_name', sa.String(), nullable=False),
    sa.Column('defendant', sa.String(), nullable=False),
    sa.Column('execution_office', sa.String(), nullable=False),
    sa.Column('execution_number', sa.String(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('execution_type', sa.String(), nullable=False),
    sa.Column('start_date', sa.Date(), nullable=False),
    sa.Column('office_archive_no', sa.String(), nullable=False),
    sa.Column('reminder_date', sa.Date(), nullable=True),
    sa.Column('reminder_text', sa.Text(), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('haciz_durumu', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('version', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('executions')
    op.drop_table('compensation_letters')
    op.drop_table('cases')
    op.drop_table('clients')
